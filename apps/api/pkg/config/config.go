package config

import "os"

type Config struct {
	AppEnv        string
	APIAddr       string
	DatabaseURL   string
	JWTSecret     string
	TelegramBot   string
	PublicAppURL  string
	AIAPIURL      string
	AIAPIKey      string
	AIModel       string
	UploadDir     string
	UploadBaseURL string
	S3Endpoint    string
	S3AccessKey   string
	S3SecretKey   string
	S3Bucket      string
	S3UseSSL      string
}

func Load() Config {
	return Config{
		AppEnv:        value("APP_ENV", "development"),
		APIAddr:       value("API_ADDR", ":8080"),
		DatabaseURL:   value("DATABASE_URL", "postgres://bazar:bazar_dev@localhost:5432/bazar_ai?sslmode=disable"),
		JWTSecret:     value("JWT_SECRET", "dev-change-me"),
		TelegramBot:   value("TELEGRAM_BOT_TOKEN", ""),
		PublicAppURL:  value("PUBLIC_APP_URL", "http://localhost:3000"),
		AIAPIURL:      value("AI_API_URL", ""),
		AIAPIKey:      value("AI_API_KEY", ""),
		AIModel:       value("AI_MODEL", "gpt-4o-mini"),
		UploadDir:     value("UPLOAD_DIR", "./uploads"),
		UploadBaseURL: value("UPLOAD_BASE_URL", "http://localhost:8080/uploads"),
		S3Endpoint:    value("STORAGE_ENDPOINT", value("S3_ENDPOINT", "")),
		S3AccessKey:   value("STORAGE_ACCESS_KEY", value("S3_ACCESS_KEY", "")),
		S3SecretKey:   value("STORAGE_SECRET_KEY", value("S3_SECRET_KEY", "")),
		S3Bucket:      value("STORAGE_BUCKET", value("S3_BUCKET", "bazar-ai")),
		S3UseSSL:      value("S3_USE_SSL", "false"),
	}
}

func value(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
