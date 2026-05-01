package main

import (
	"context"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"bazar-ai/apps/api/internal/admin"
	"bazar-ai/apps/api/internal/ai"
	"bazar-ai/apps/api/internal/auth"
	"bazar-ai/apps/api/internal/onboarding"
	"bazar-ai/apps/api/internal/orders"
	"bazar-ai/apps/api/internal/platform"
	"bazar-ai/apps/api/internal/products"
	"bazar-ai/apps/api/internal/storage"
	"bazar-ai/apps/api/internal/stores"
	"bazar-ai/apps/api/internal/sprint"
	"bazar-ai/apps/api/internal/telegram"
	"bazar-ai/apps/api/pkg/config"
	"bazar-ai/apps/api/pkg/database"
	"bazar-ai/apps/api/pkg/httpx"
	"bazar-ai/apps/api/pkg/middleware"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect postgres: %v", err)
	}
	defer db.Close()

	repo := platform.NewRepository(db)
	authHandler := auth.NewHandler(repo, cfg.JWTSecret)
	storeHandler := stores.NewHandler(repo)
	productHandler := products.NewHandler(repo)
	useS3SSL, _ := strconv.ParseBool(cfg.S3UseSSL)
	storageHandler, err := storage.NewMinIOHandler(repo, cfg.UploadDir, cfg.UploadBaseURL, cfg.S3Endpoint, cfg.S3AccessKey, cfg.S3SecretKey, cfg.S3Bucket, useS3SSL)
	if err != nil {
		log.Fatalf("init storage: %v", err)
	}
	telegramNotifier := telegram.NewBotNotifier(cfg.TelegramBot)
	orderHandler := orders.NewHandler(repo, telegramNotifier, cfg.PublicAppURL)
	telegramHandler := telegram.NewHandler(repo, telegramNotifier)
	aiHandler := ai.NewHandler(repo, ai.NewService(cfg.AIAPIURL, cfg.AIAPIKey, cfg.AIModel))
	onboardingHandler := onboarding.NewHandler(repo, cfg.PublicAppURL)
	adminHandler := admin.NewHandler(repo)
	sprintHandler := sprint.NewHandler(repo)

	owner := authHandler.Middleware("owner", "admin", "manager")
	adminOnly := authHandler.Middleware("admin")
	statusMetrics := middleware.NewStatusMetrics()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "bazar-ai-api"})
	})
	mux.Handle("GET /metrics", statusMetrics.Handler())

	mux.HandleFunc("POST /api/v1/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)
	mux.HandleFunc("POST /api/v1/auth/refresh", authHandler.Refresh)
	mux.HandleFunc("POST /api/v1/auth/logout", authHandler.Logout)
	mux.Handle("POST /api/v1/auth/logout-all", authHandler.AnyAuthenticated()(http.HandlerFunc(authHandler.LogoutAll)))

	mux.Handle("POST /api/v1/onboarding/complete", owner(http.HandlerFunc(onboardingHandler.Complete)))

	mux.Handle("POST /api/v1/stores", owner(http.HandlerFunc(storeHandler.Create)))
	mux.Handle("GET /api/v1/stores/me", owner(http.HandlerFunc(storeHandler.ListMine)))
	mux.Handle("GET /api/v1/stores/{id}", owner(http.HandlerFunc(storeHandler.Get)))
	mux.HandleFunc("GET /api/v1/public/stores/{slug}", storeHandler.PublicStore)

	mux.Handle("POST /api/v1/stores/{storeID}/products", owner(http.HandlerFunc(productHandler.Create)))
	mux.Handle("GET /api/v1/stores/{storeID}/products", owner(http.HandlerFunc(productHandler.ListByStore)))
	mux.Handle("GET /api/v1/products/{id}", owner(http.HandlerFunc(productHandler.Get)))
	mux.Handle("POST /api/v1/products/{id}/images", owner(http.HandlerFunc(storageHandler.UploadProductImage)))
	mux.Handle("POST /api/v1/uploads/images", owner(http.HandlerFunc(storageHandler.UploadProductImage)))
	mux.Handle("GET /uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(cfg.UploadDir))))

	mux.HandleFunc("POST /api/v1/public/stores/{slug}/orders", orderHandler.CreatePublic)
	mux.Handle("GET /api/v1/stores/{storeID}/orders", owner(http.HandlerFunc(orderHandler.ListByStore)))
	mux.Handle("GET /api/v1/orders/{id}/notifications", owner(http.HandlerFunc(orderHandler.NotificationsByOrder)))

	mux.Handle("POST /api/v1/stores/{storeID}/telegram/connect-code", owner(http.HandlerFunc(telegramHandler.ConnectCode)))
	mux.Handle("GET /api/v1/stores/{storeID}/telegram/status", owner(http.HandlerFunc(telegramHandler.Status)))
	mux.Handle("POST /api/v1/stores/{storeID}/telegram/test", owner(http.HandlerFunc(telegramHandler.Test)))
	mux.HandleFunc("POST /api/v1/telegram/webhook", telegramHandler.Webhook)

	mux.Handle("POST /api/v1/ai/generate-store", owner(http.HandlerFunc(aiHandler.GenerateStore)))
	mux.Handle("POST /api/v1/ai/generate-product", owner(http.HandlerFunc(aiHandler.GenerateProduct)))
	mux.Handle("POST /api/v1/ai/generate-seo", owner(http.HandlerFunc(aiHandler.GenerateSEO)))
	mux.Handle("POST /api/v1/ai/generate-marketing", owner(http.HandlerFunc(aiHandler.GenerateMarketing)))

	mux.Handle("GET /api/v1/admin/stats", adminOnly(http.HandlerFunc(adminHandler.Stats)))

	mux.HandleFunc("POST /api/onboarding/create-store", sprintHandler.CreateStore)
	mux.HandleFunc("GET /api/dashboard/stores", sprintHandler.DashboardStores)
	mux.HandleFunc("GET /api/dashboard/leads", sprintHandler.DashboardLeads)
	mux.HandleFunc("GET /api/store/{slug}", sprintHandler.StoreBySlug)
	mux.HandleFunc("POST /api/store/{slug}/lead", sprintHandler.CreateLead)

	handler := middleware.StructuredLogger(middleware.RequestID(statusMetrics.Middleware(middleware.NewRateLimiter(120, time.Minute).Middleware(withCORS(mux, cfg.AllowedOrigins)))))
	server := &http.Server{Addr: cfg.APIAddr, Handler: handler}
	log.Printf("Bazar AI API listening on %s (%s)", cfg.APIAddr, cfg.AppEnv)
	log.Fatal(server.ListenAndServe())
}

func withCORS(next http.Handler, rawAllowedOrigins string) http.Handler {
	allowAny := strings.TrimSpace(rawAllowedOrigins) == "*"
	allowedOrigins := map[string]struct{}{}
	if !allowAny {
		for _, origin := range strings.Split(rawAllowedOrigins, ",") {
			normalized := strings.TrimSpace(origin)
			if normalized == "" {
				continue
			}
			allowedOrigins[normalized] = struct{}{}
		}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if allowAny {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		} else if origin != "" {
			if _, ok := allowedOrigins[origin]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
			} else {
				httpx.ErrorWithRequest(w, r, http.StatusForbidden, "forbidden", "origin is not allowed")
				return
			}
		}
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
