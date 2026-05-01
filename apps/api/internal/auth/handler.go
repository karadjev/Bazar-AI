package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
	"time"

	"bazar-ai/apps/api/internal/platform"
	"bazar-ai/apps/api/pkg/httpx"
	"bazar-ai/apps/api/pkg/validator"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type contextKey string

const UserContextKey contextKey = "auth_user"

type Handler struct {
	repo      *platform.Repository
	jwtSecret []byte
}

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func NewHandler(repo *platform.Repository, jwtSecret string) Handler {
	return Handler{repo: repo, jwtSecret: []byte(jwtSecret)}
}

func (h Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := httpx.Decode(r, &req); err != nil || req.Password == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "invalid register payload")
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Phone = validator.Phone(req.Phone)
	if req.Email == "" && req.Phone == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "email or phone is required")
		return
	}
	if err := validatePassword(req.Password); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not hash password")
		return
	}
	user, err := h.repo.CreateUser(r.Context(), platform.User{Phone: req.Phone, Email: req.Email, PasswordHash: string(hash), Role: "owner"})
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusConflict, "conflict", "user already exists or payload is invalid")
		return
	}
	h.issueTokenPair(w, r, user)
}

func (h Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	if err := httpx.Decode(r, &req); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "invalid login payload")
		return
	}
	req.Login = strings.TrimSpace(req.Login)
	user, err := h.repo.UserByLogin(r.Context(), req.Login)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "invalid credentials")
		return
	}
	_ = h.repo.AddAuditLog(r.Context(), platform.AuditLog{UserID: user.ID, Action: "auth.login", EntityType: "user", EntityID: user.ID})
	h.issueTokenPair(w, r, user)
}

func (h Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req struct {
		RefreshToken string `json:"refresh_token"`
		DeviceID     string `json:"device_id"`
	}
	if err := httpx.Decode(r, &req); err != nil || req.RefreshToken == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "invalid refresh payload")
		return
	}
	user, err := h.repo.RefreshTokenActive(r.Context(), tokenHash(req.RefreshToken), req.DeviceID)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "refresh token expired or revoked")
		return
	}
	access, err := h.accessToken(user)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not issue access token")
		return
	}
	refresh := randomToken()
	if err := h.repo.RotateRefreshToken(r.Context(), tokenHash(req.RefreshToken), tokenHash(refresh), req.DeviceID); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "refresh token expired or revoked")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"access_token": access, "refresh_token": refresh})
}

func (h Handler) Logout(w http.ResponseWriter, r *http.Request) {
	var req struct {
		RefreshToken string `json:"refresh_token"`
		All          bool   `json:"all"`
	}
	if err := httpx.Decode(r, &req); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "invalid logout payload")
		return
	}
	if req.All {
		user := UserFromRequest(r)
		if user.ID == "" {
			httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing token")
			return
		}
		if err := h.repo.RevokeRefreshTokensByUser(r.Context(), user.ID); err != nil {
			httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not revoke sessions")
			return
		}
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "logged_out"})
		return
	}
	if req.RefreshToken == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "refresh_token is required")
		return
	}
	if err := h.repo.RevokeRefreshToken(r.Context(), tokenHash(req.RefreshToken)); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not revoke token")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "logged_out"})
}

func (h Handler) LogoutAll(w http.ResponseWriter, r *http.Request) {
	user := UserFromRequest(r)
	if user.ID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing token")
		return
	}
	if err := h.repo.RevokeRefreshTokensByUser(r.Context(), user.ID); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not revoke sessions")
		return
	}
	_ = h.repo.AddAuditLog(r.Context(), platform.AuditLog{UserID: user.ID, Action: "auth.logout_all", EntityType: "user", EntityID: user.ID})
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "logged_out"})
}

func (h Handler) Me(w http.ResponseWriter, r *http.Request) {
	user := UserFromRequest(r)
	if user.ID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing token")
		return
	}
	fullUser, err := h.repo.UserByID(r.Context(), user.ID)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusNotFound, "not_found", "user not found")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"user": fullUser})
}

func (h Handler) AnyAuthenticated() func(http.Handler) http.Handler {
	return h.Middleware("owner", "admin", "manager", "support")
}

func (h Handler) Middleware(roles ...string) func(http.Handler) http.Handler {
	allowed := map[string]bool{}
	for _, role := range roles {
		allowed[role] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenValue := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
			if tokenValue == "" {
				httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing token")
				return
			}
			claims := &Claims{}
			token, err := jwt.ParseWithClaims(tokenValue, claims, func(token *jwt.Token) (any, error) {
				return h.jwtSecret, nil
			})
			if err != nil || !token.Valid {
				httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "invalid token")
				return
			}
			if len(allowed) > 0 && !allowed[claims.Role] {
				httpx.ErrorWithRequest(w, r, http.StatusForbidden, "forbidden", "insufficient role")
				return
			}
			user := platform.User{ID: claims.UserID, Role: claims.Role}
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), UserContextKey, user)))
		})
	}
}

func UserFromRequest(r *http.Request) platform.User {
	user, _ := r.Context().Value(UserContextKey).(platform.User)
	return user
}

func (h Handler) issueTokenPair(w http.ResponseWriter, r *http.Request, user platform.User) {
	access, err := h.accessToken(user)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not issue token")
		return
	}
	refresh := randomToken()
	if err := h.repo.SaveRefreshToken(r.Context(), user.ID, tokenHash(refresh), r.Header.Get("X-Device-Id")); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not save refresh token")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"user": user, "access_token": access, "refresh_token": refresh})
}

func validatePassword(password string) error {
	if len([]rune(password)) < 8 {
		return errors.New("password must contain at least 8 characters")
	}
	hasLetter := false
	hasDigit := false
	for _, char := range password {
		if char >= '0' && char <= '9' {
			hasDigit = true
		}
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') {
			hasLetter = true
		}
	}
	if !hasLetter || !hasDigit {
		return errors.New("password must contain letters and digits")
	}
	return nil
}

func (h Handler) accessToken(user platform.User) (string, error) {
	claims := Claims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.ID,
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(h.jwtSecret)
}

func tokenHash(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func randomToken() string {
	bytes := make([]byte, 32)
	_, _ = rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
