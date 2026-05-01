package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	AppEnv         string
	APIAddr        string
	DatabaseURL    string
	AllowedOrigins string
	JWTSecret      string
	TelegramBot    string
	PublicAppURL   string
	AIAPIURL       string
	AIAPIKey       string
	AIModel        string
	UploadDir      string
	UploadBaseURL  string
	S3Endpoint     string
	S3AccessKey    string
	S3SecretKey    string
	S3Bucket       string
	S3UseSSL       string
}

func Load() (Config, error) {
	appEnv := value("APP_ENV", "development")
	strict := isStrictEnv(appEnv)
	missing := []string{}

	publicAppURL := requiredValue("PUBLIC_APP_URL", "http://localhost:3000", strict, &missing)
	cfg := Config{
		AppEnv:         appEnv,
		APIAddr:        value("API_ADDR", ":8080"),
		DatabaseURL:    requiredValue("DATABASE_URL", "postgres://bazar:bazar_dev@localhost:5432/bazar_ai?sslmode=disable", strict, &missing),
		AllowedOrigins: value("ALLOWED_ORIGINS", publicAppURL),
		JWTSecret:      requiredValue("JWT_SECRET", "dev-change-me", strict, &missing),
		TelegramBot:    value("TELEGRAM_BOT_TOKEN", ""),
		PublicAppURL:   publicAppURL,
		AIAPIURL:       value("AI_API_URL", ""),
		AIAPIKey:       value("AI_API_KEY", ""),
		AIModel:        value("AI_MODEL", "gpt-4o-mini"),
		UploadDir:      value("UPLOAD_DIR", "./uploads"),
		UploadBaseURL:  requiredValue("UPLOAD_BASE_URL", "http://localhost:8080/uploads", strict, &missing),
		S3Endpoint:     value("STORAGE_ENDPOINT", value("S3_ENDPOINT", "")),
		S3AccessKey:    value("STORAGE_ACCESS_KEY", value("S3_ACCESS_KEY", "")),
		S3SecretKey:    value("STORAGE_SECRET_KEY", value("S3_SECRET_KEY", "")),
		S3Bucket:       value("STORAGE_BUCKET", value("S3_BUCKET", "bazar-ai")),
		S3UseSSL:       value("S3_USE_SSL", "false"),
	}
	if err := cfg.validate(missing); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func value(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func requiredValue(key, fallback string, strict bool, missing *[]string) string {
	if v, ok := os.LookupEnv(key); ok && strings.TrimSpace(v) != "" {
		return v
	}
	if strict {
		*missing = append(*missing, key)
	}
	return fallback
}

func (c Config) validate(missing []string) error {
	if !isStrictEnv(c.AppEnv) {
		return nil
	}

	problems := []string{}
	if len(missing) > 0 {
		problems = append(problems, "missing required env: "+strings.Join(missing, ", "))
	}
	if strings.TrimSpace(c.JWTSecret) == "" {
		problems = append(problems, "JWT_SECRET is required")
	}
	if isWeakSecret(c.JWTSecret) {
		problems = append(problems, "JWT_SECRET must be a non-placeholder secret")
	}
	if len(c.JWTSecret) < 32 {
		problems = append(problems, "JWT_SECRET must be at least 32 characters")
	}
	if strings.TrimSpace(c.AllowedOrigins) == "" {
		problems = append(problems, "ALLOWED_ORIGINS or PUBLIC_APP_URL is required")
	}
	if strings.TrimSpace(c.AllowedOrigins) == "*" {
		problems = append(problems, "ALLOWED_ORIGINS cannot be * in staging/production")
	}
	if c.S3Endpoint != "" {
		if strings.TrimSpace(c.S3AccessKey) == "" {
			problems = append(problems, "STORAGE_ACCESS_KEY or S3_ACCESS_KEY is required when S3 endpoint is configured")
		}
		if strings.TrimSpace(c.S3SecretKey) == "" {
			problems = append(problems, "STORAGE_SECRET_KEY or S3_SECRET_KEY is required when S3 endpoint is configured")
		}
		if strings.TrimSpace(c.S3Bucket) == "" {
			problems = append(problems, "STORAGE_BUCKET or S3_BUCKET is required when S3 endpoint is configured")
		}
	}
	if len(problems) > 0 {
		return fmt.Errorf("invalid config for %s: %s", c.AppEnv, strings.Join(problems, "; "))
	}
	return nil
}

func isStrictEnv(appEnv string) bool {
	switch strings.ToLower(strings.TrimSpace(appEnv)) {
	case "production", "prod", "staging":
		return true
	default:
		return false
	}
}

func isWeakSecret(secret string) bool {
	normalized := strings.ToLower(strings.TrimSpace(secret))
	if strings.Contains(normalized, "change-me") {
		return true
	}
	switch normalized {
	case "change-me", "changeme", "dev-change-me", "secret", "jwt-secret":
		return true
	default:
		return false
	}
}
