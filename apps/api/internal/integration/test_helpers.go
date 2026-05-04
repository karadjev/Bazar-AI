package integration

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
	"time"

	"bazar-ai/apps/api/internal/auth"
	"bazar-ai/apps/api/internal/onboarding"
	"bazar-ai/apps/api/internal/orders"
	"bazar-ai/apps/api/internal/platform"
	"bazar-ai/apps/api/internal/products"
	"bazar-ai/apps/api/internal/stores"
	"bazar-ai/apps/api/internal/telegram"
	"bazar-ai/apps/api/pkg/database"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type integrationEnv struct {
	db      *pgxpool.Pool
	server  *httptest.Server
	baseURL string
}

func newIntegrationEnv(t *testing.T) *integrationEnv {
	t.Helper()

	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("set TEST_DATABASE_URL to run integration tests")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	db, err := database.Connect(ctx, databaseURL)
	if err != nil {
		t.Fatalf("connect test database: %v", err)
	}
	if err := applyMigrationsFromDir(ctx, db, "../../migrations"); err != nil {
		db.Close()
		t.Fatalf("apply migrations: %v", err)
	}

	repo := platform.NewRepository(db)
	authHandler := auth.NewHandler(repo, "integration-secret")
	onboardingHandler := onboarding.NewHandler(repo, "http://example.test")
	storeHandler := stores.NewHandler(repo)
	productHandler := products.NewHandler(repo)
	orderHandler := orders.NewHandler(repo, telegram.NewBotNotifier(""), "http://example.test")
	owner := authHandler.Middleware("owner", "admin", "manager")

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/v1/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/v1/auth/refresh", authHandler.Refresh)
	mux.HandleFunc("POST /api/v1/auth/logout", authHandler.Logout)
	mux.Handle("POST /api/v1/auth/logout-all", authHandler.AnyAuthenticated()(http.HandlerFunc(authHandler.LogoutAll)))
	mux.Handle("POST /api/v1/onboarding/complete", owner(http.HandlerFunc(onboardingHandler.Complete)))
	mux.Handle("POST /api/v1/stores/{storeID}/products", owner(http.HandlerFunc(productHandler.Create)))
	mux.Handle("GET /api/v1/stores/{storeID}/orders", owner(http.HandlerFunc(orderHandler.ListByStore)))
	mux.Handle("GET /api/v1/orders/{id}/notifications", owner(http.HandlerFunc(orderHandler.NotificationsByOrder)))
	mux.HandleFunc("GET /api/v1/public/stores/{slug}", storeHandler.PublicStore)
	mux.HandleFunc("POST /api/v1/public/stores/{slug}/orders", orderHandler.CreatePublic)

	server := httptest.NewServer(mux)
	return &integrationEnv{db: db, server: server, baseURL: server.URL}
}

func (e *integrationEnv) Close() {
	if e.server != nil {
		e.server.Close()
	}
	if e.db != nil {
		e.db.Close()
	}
}

func applyMigrations(ctx context.Context, db interface {
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
}, migrationPaths ...string) error {
	for _, p := range migrationPaths {
		content, err := os.ReadFile(filepath.Clean(p))
		if err != nil {
			return err
		}
		if _, err := db.Exec(ctx, string(content)); err != nil {
			return err
		}
	}
	return nil
}

func applyMigrationsFromDir(ctx context.Context, db interface {
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
}, dir string) error {
	entries, err := os.ReadDir(filepath.Clean(dir))
	if err != nil {
		return err
	}
	migrationPaths := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		migrationPaths = append(migrationPaths, filepath.Join(dir, entry.Name()))
	}
	sort.Strings(migrationPaths)
	return applyMigrations(ctx, db, migrationPaths...)
}

func postJSON[T any](t *testing.T, url string, payload any, headers map[string]string, wantStatus int) T {
	t.Helper()

	body, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("marshal payload: %v", err)
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		t.Fatalf("create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("perform request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != wantStatus {
		var raw map[string]any
		_ = json.NewDecoder(resp.Body).Decode(&raw)
		t.Fatalf("expected status %d, got %d, body=%v", wantStatus, resp.StatusCode, raw)
	}

	var out T
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	return out
}

func getJSON[T any](t *testing.T, url string, headers map[string]string, wantStatus int) T {
	t.Helper()

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		t.Fatalf("create request: %v", err)
	}
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("perform request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != wantStatus {
		var raw map[string]any
		_ = json.NewDecoder(resp.Body).Decode(&raw)
		t.Fatalf("expected status %d, got %d, body=%v", wantStatus, resp.StatusCode, raw)
	}

	var out T
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	return out
}
