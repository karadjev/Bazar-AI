package config

import (
	"strings"
	"testing"
)

func TestLoadAllowsDevelopmentDefaults(t *testing.T) {
	clearOptionalEnv(t)
	t.Setenv("APP_ENV", "development")
	t.Setenv("DATABASE_URL", "")
	t.Setenv("JWT_SECRET", "")
	t.Setenv("PUBLIC_APP_URL", "")
	t.Setenv("UPLOAD_BASE_URL", "")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.JWTSecret != "dev-change-me" {
		t.Fatalf("JWTSecret = %q, want development fallback", cfg.JWTSecret)
	}
}

func TestLoadFailsFastForMissingProductionEnv(t *testing.T) {
	clearOptionalEnv(t)
	t.Setenv("APP_ENV", "production")
	t.Setenv("DATABASE_URL", "")
	t.Setenv("JWT_SECRET", "")
	t.Setenv("PUBLIC_APP_URL", "")
	t.Setenv("UPLOAD_BASE_URL", "")

	_, err := Load()
	if err == nil {
		t.Fatal("Load() error = nil, want fail-fast error")
	}
	message := err.Error()
	for _, want := range []string{"DATABASE_URL", "JWT_SECRET", "PUBLIC_APP_URL", "UPLOAD_BASE_URL"} {
		if !strings.Contains(message, want) {
			t.Fatalf("Load() error = %q, want it to mention %s", message, want)
		}
	}
}

func TestLoadRejectsWeakProductionJWTSecret(t *testing.T) {
	clearOptionalEnv(t)
	t.Setenv("APP_ENV", "production")
	t.Setenv("DATABASE_URL", "postgres://user:pass@postgres:5432/bazar_ai?sslmode=disable")
	t.Setenv("JWT_SECRET", "change-me")
	t.Setenv("PUBLIC_APP_URL", "https://example.com")
	t.Setenv("UPLOAD_BASE_URL", "https://example.com/uploads")

	_, err := Load()
	if err == nil {
		t.Fatal("Load() error = nil, want weak JWT_SECRET error")
	}
	if !strings.Contains(err.Error(), "JWT_SECRET must be a non-placeholder secret") {
		t.Fatalf("Load() error = %q, want weak JWT_SECRET message", err.Error())
	}
}

func TestLoadRejectsWildcardProductionCORS(t *testing.T) {
	clearOptionalEnv(t)
	t.Setenv("APP_ENV", "production")
	t.Setenv("DATABASE_URL", "postgres://user:pass@postgres:5432/bazar_ai?sslmode=disable")
	t.Setenv("JWT_SECRET", "super-secret-jwt-key-with-32-chars")
	t.Setenv("PUBLIC_APP_URL", "https://example.com")
	t.Setenv("UPLOAD_BASE_URL", "https://example.com/uploads")
	t.Setenv("ALLOWED_ORIGINS", "*")

	_, err := Load()
	if err == nil {
		t.Fatal("Load() error = nil, want wildcard CORS error")
	}
	if !strings.Contains(err.Error(), "ALLOWED_ORIGINS cannot be *") {
		t.Fatalf("Load() error = %q, want wildcard CORS message", err.Error())
	}
}

func TestLoadAllowsStrictEnvWithExplicitConfig(t *testing.T) {
	clearOptionalEnv(t)
	t.Setenv("APP_ENV", "staging")
	t.Setenv("DATABASE_URL", "postgres://user:pass@postgres:5432/bazar_ai?sslmode=disable")
	t.Setenv("JWT_SECRET", "super-secret-jwt-key-with-32-chars")
	t.Setenv("PUBLIC_APP_URL", "https://staging.example.com")
	t.Setenv("UPLOAD_BASE_URL", "https://staging.example.com/uploads")
	t.Setenv("S3_ENDPOINT", "minio:9000")
	t.Setenv("S3_ACCESS_KEY", "bazar")
	t.Setenv("S3_SECRET_KEY", "not-a-real-secret-but-present")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.AllowedOrigins != "https://staging.example.com" {
		t.Fatalf("AllowedOrigins = %q, want PUBLIC_APP_URL fallback", cfg.AllowedOrigins)
	}
}

func clearOptionalEnv(t *testing.T) {
	t.Helper()

	for _, key := range []string{
		"ALLOWED_ORIGINS",
		"STORAGE_ENDPOINT",
		"STORAGE_ACCESS_KEY",
		"STORAGE_SECRET_KEY",
		"STORAGE_BUCKET",
		"S3_ENDPOINT",
		"S3_ACCESS_KEY",
		"S3_SECRET_KEY",
		"S3_BUCKET",
	} {
		t.Setenv(key, "")
	}
}
