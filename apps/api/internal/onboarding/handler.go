package onboarding

import (
	"net/http"

	"bazar-ai/apps/api/internal/auth"
	"bazar-ai/apps/api/internal/platform"
	"bazar-ai/apps/api/pkg/httpx"
)

type Handler struct {
	repo   *platform.Repository
	appURL string
}

func NewHandler(repo *platform.Repository, appURL string) Handler {
	return Handler{repo: repo, appURL: appURL}
}

func (h Handler) Complete(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Niche    string            `json:"niche"`
		Name     string            `json:"name"`
		Region   string            `json:"region"`
		City     string            `json:"city"`
		Style    string            `json:"style"`
		Contacts platform.Contacts `json:"contacts"`
	}
	if err := httpx.Decode(r, &req); err != nil {
		httpx.RespondDecodeError(w, r, err, "invalid onboarding payload")
		return
	}
	if req.Name == "" {
		req.Name = req.Niche + " Market"
	}
	user := auth.UserFromRequest(r)
	count, err := h.repo.StoreCountByOwner(r.Context(), user.ID)
	if err == nil && count >= platform.DefaultFreeLimits().StoreLimit {
		httpx.ErrorWithRequest(w, r, http.StatusPaymentRequired, "quota_exceeded", "free tariff allows only one store")
		return
	}
	store, err := h.repo.CreateStore(r.Context(), platform.Store{
		OwnerID: user.ID, Name: req.Name, Niche: req.Niche, Description: "AI-магазин для ниши: " + req.Niche,
		Region: req.Region, City: req.City, Currency: "RUB", Theme: req.Style, Style: req.Style, Contacts: req.Contacts,
	})
	if err != nil {
		httpx.RespondInfraError(w, r, err, "could not create store")
		return
	}
	_, _ = h.repo.AddGeneration(r.Context(), platform.AIGeneration{
		UserID: user.ID, StoreID: store.ID, Type: "store_onboarding", Input: req.Niche,
		Output: "Created store " + store.Name + " with public storefront", TokensUsed: 120, Provider: "bazar-ai-template-v1", Status: "completed",
	})
	_ = h.repo.AddAuditLog(r.Context(), platform.AuditLog{UserID: user.ID, Action: "store.onboarding_completed", EntityType: "store", EntityID: store.ID})
	httpx.JSON(w, http.StatusCreated, map[string]any{
		"store":      store,
		"public_url": platform.StoreURL(h.appURL, store.Slug),
	})
}
