package auth

import (
	"testing"
	"time"

	"bazar-ai/apps/api/internal/platform"

	"github.com/golang-jwt/jwt/v5"
)

func TestValidatePassword(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{name: "valid password", password: "abc12345", wantErr: false},
		{name: "too short", password: "a1b2c3", wantErr: true},
		{name: "missing digits", password: "abcdefgh", wantErr: true},
		{name: "missing letters", password: "12345678", wantErr: true},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			err := validatePassword(tc.password)
			if tc.wantErr && err == nil {
				t.Fatalf("expected error for %q, got nil", tc.password)
			}
			if !tc.wantErr && err != nil {
				t.Fatalf("expected no error for %q, got %v", tc.password, err)
			}
		})
	}
}

func TestTokenHashIsDeterministic(t *testing.T) {
	t.Parallel()

	first := tokenHash("refresh-token-value")
	second := tokenHash("refresh-token-value")

	if first != second {
		t.Fatalf("expected deterministic token hash, got %q and %q", first, second)
	}
	if len(first) != 64 {
		t.Fatalf("expected SHA-256 hex length 64, got %d", len(first))
	}
}

func TestAccessTokenIncludesClaimsAndExpiry(t *testing.T) {
	t.Parallel()

	handler := Handler{jwtSecret: []byte("test-secret")}
	user := platform.User{ID: "user-123", Role: "owner"}

	tokenString, err := handler.accessToken(user)
	if err != nil {
		t.Fatalf("accessToken() returned error: %v", err)
	}

	parsedClaims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, parsedClaims, func(token *jwt.Token) (any, error) {
		return []byte("test-secret"), nil
	})
	if err != nil {
		t.Fatalf("could not parse signed token: %v", err)
	}
	if !token.Valid {
		t.Fatal("expected signed token to be valid")
	}
	if parsedClaims.UserID != user.ID {
		t.Fatalf("expected user_id %q, got %q", user.ID, parsedClaims.UserID)
	}
	if parsedClaims.Role != user.Role {
		t.Fatalf("expected role %q, got %q", user.Role, parsedClaims.Role)
	}
	if parsedClaims.ExpiresAt == nil {
		t.Fatal("expected expires_at claim to be present")
	}
	ttl := time.Until(parsedClaims.ExpiresAt.Time)
	if ttl < 14*time.Minute || ttl > 16*time.Minute {
		t.Fatalf("expected TTL around 15 minutes, got %s", ttl)
	}
}
