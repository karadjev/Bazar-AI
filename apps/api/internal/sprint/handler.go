package sprint

import (
	"net/http"

	"bazar-ai/apps/api/internal/platform"
	"bazar-ai/apps/api/pkg/httpx"
	"bazar-ai/apps/api/pkg/validator"
)

type Handler struct {
	repo *platform.Repository
}

func NewHandler(repo *platform.Repository) Handler {
	return Handler{repo: repo}
}

func (h Handler) CreateStore(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string            `json:"name"`
		Niche    string            `json:"niche"`
		City     string            `json:"city"`
		Region   string            `json:"region"`
		Style    string            `json:"style"`
		Contacts platform.Contacts `json:"contacts"`
	}
	if err := httpx.Decode(r, &req); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "invalid payload")
		return
	}
	req.Name = validator.Text(req.Name, 80)
	req.Niche = validator.Text(req.Niche, 80)
	req.City = validator.Text(req.City, 80)
	req.Region = validator.Text(req.Region, 80)
	req.Style = validator.Text(req.Style, 64)
	req.Contacts.Phone = validator.Phone(req.Contacts.Phone)
	req.Contacts.WhatsApp = validator.Phone(req.Contacts.WhatsApp)
	req.Contacts.Telegram = validator.Text(req.Contacts.Telegram, 80)
	if req.Name == "" || req.City == "" || req.Niche == "" || req.Style == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "name, niche, city and style are required")
		return
	}
	if err := validator.Length(req.Name, "name", 2, 80); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	ownerID := resolveOwnerID(r)
	if ownerID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing owner context")
		return
	}
	store, err := h.repo.CreateStore(r.Context(), platform.Store{
		OwnerID:     ownerID,
		Name:        req.Name,
		Niche:       req.Niche,
		Region:      req.Region,
		City:        req.City,
		Theme:       req.Style,
		Style:       req.Style,
		Description: "Store generated from onboarding",
		Currency:    "RUB",
		Contacts:    req.Contacts,
	})
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "could not create store")
		return
	}
	httpx.JSON(w, http.StatusCreated, map[string]any{"store": store})
}

func (h Handler) DashboardStores(w http.ResponseWriter, r *http.Request) {
	ownerID := resolveOwnerID(r)
	if ownerID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing owner context")
		return
	}
	page, limit := httpx.Page(r)
	stores, total, err := h.repo.StoresByOwner(r.Context(), ownerID, limit, httpx.Offset(page, limit))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not load stores")
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.ListResponse{Data: stores, Meta: httpx.Pagination{Page: page, Limit: limit, Total: total}})
}

func (h Handler) DashboardLeads(w http.ResponseWriter, r *http.Request) {
	ownerID := resolveOwnerID(r)
	if ownerID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing owner context")
		return
	}
	stores, _, err := h.repo.StoresByOwner(r.Context(), ownerID, 50, 0)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not load stores")
		return
	}
	leads := []platform.Lead{}
	for _, store := range stores {
		storeLeads, _, leadErr := h.repo.LeadsByStore(r.Context(), store.ID, 50, 0)
		if leadErr != nil {
			continue
		}
		leads = append(leads, storeLeads...)
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"data": leads, "meta": map[string]int{"total": len(leads)}})
}

func (h Handler) StoreBySlug(w http.ResponseWriter, r *http.Request) {
	store, err := h.repo.StoreBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusNotFound, "not_found", "store not found")
		return
	}
	products, _, _ := h.repo.ProductsByStore(r.Context(), store.ID, 24, 0)
	httpx.JSON(w, http.StatusOK, map[string]any{"store": store, "products": products})
}

func (h Handler) CreateLead(w http.ResponseWriter, r *http.Request) {
	store, err := h.repo.StoreBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusNotFound, "not_found", "store not found")
		return
	}
	var req struct {
		CustomerName string `json:"customerName"`
		Phone        string `json:"phone"`
		Message      string `json:"message"`
	}
	if err := httpx.Decode(r, &req); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "invalid lead payload")
		return
	}
	name := validator.Text(req.CustomerName, 80)
	phone := validator.Phone(req.Phone)
	message := validator.Text(req.Message, 400)
	if name == "" || phone == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "name and phone are required")
		return
	}
	if err := validator.Length(name, "customer_name", 2, 80); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	lead, err := h.repo.CreateLead(r.Context(), platform.Lead{
		StoreID:      store.ID,
		CustomerName: name,
		Phone:        phone,
		Message:      message,
		Status:       "new",
	})
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not create lead")
		return
	}
	httpx.JSON(w, http.StatusCreated, lead)
}
