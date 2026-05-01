package ai

import (
	"net/http"
	"strings"

	"bazar-ai/apps/api/internal/auth"
	"bazar-ai/apps/api/internal/platform"
	"bazar-ai/apps/api/pkg/httpx"
)

type Handler struct {
	repo    *platform.Repository
	service Service
}

func NewHandler(repo *platform.Repository, service Service) Handler {
	return Handler{repo: repo, service: service}
}

func (h Handler) GenerateStore(w http.ResponseWriter, r *http.Request) {
	h.generate(w, r, "store")
}

func (h Handler) GenerateProduct(w http.ResponseWriter, r *http.Request) {
	h.generate(w, r, "product")
}

func (h Handler) GenerateSEO(w http.ResponseWriter, r *http.Request) {
	h.generate(w, r, "seo")
}

func (h Handler) GenerateMarketing(w http.ResponseWriter, r *http.Request) {
	h.generate(w, r, "marketing")
}

func (h Handler) generate(w http.ResponseWriter, r *http.Request, generationType string) {
	var req struct {
		UserID  string `json:"user_id"`
		StoreID string `json:"store_id"`
		Input   string `json:"input"`
	}
	if err := httpx.Decode(r, &req); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "invalid ai payload")
		return
	}
	user := auth.UserFromRequest(r)
	if req.UserID == "" {
		req.UserID = user.ID
	}
	limits := platform.DefaultFreeLimits()
	if req.StoreID != "" {
		if storeLimits, err := h.repo.TariffLimitsByStore(r.Context(), req.StoreID); err == nil {
			limits = storeLimits
		}
	}
	if req.UserID != "" {
		count, err := h.repo.AIGenerationCountThisMonth(r.Context(), req.UserID)
		if err == nil && count >= limits.AIGenerationLimit {
			httpx.ErrorWithRequest(w, r, http.StatusPaymentRequired, "quota_exceeded", "AI generation limit exceeded for tariff "+limits.Code)
			return
		}
	}
	output, provider, err := h.service.Generate(r.Context(), generationType, req.Input)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadGateway, "upstream_error", "ai provider failed")
		return
	}
	generation, err := h.repo.AddGeneration(r.Context(), platform.AIGeneration{
		UserID: req.UserID, StoreID: req.StoreID, Type: generationType, Input: req.Input,
		Output: output, TokensUsed: estimateTokens(req.Input, output), Provider: provider, Status: "completed", Cost: 0,
	})
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not save generation")
		return
	}
	httpx.JSON(w, http.StatusOK, generation)
}

func titleFromInput(input string) string {
	input = strings.TrimSpace(input)
	if input == "" {
		return "Kavkaz"
	}
	parts := strings.Fields(input)
	if len(parts) > 3 {
		parts = parts[:3]
	}
	return strings.Join(parts, " ")
}

func estimateTokens(parts ...string) int {
	total := 0
	for _, part := range parts {
		total += len([]rune(part)) / 4
	}
	if total < 1 {
		return 1
	}
	return total
}
