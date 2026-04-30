package stores

import (
	"net/http"

	"bazar-ai/apps/api/internal/auth"
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

func (h Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req platform.Store
	if err := httpx.Decode(r, &req); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "invalid store payload")
		return
	}
	req.Name = validator.Text(req.Name, 80)
	req.City = validator.Text(req.City, 80)
	req.Region = validator.Text(req.Region, 80)
	req.Description = validator.Text(req.Description, 400)
	req.Contacts.Phone = validator.Phone(req.Contacts.Phone)
	req.Contacts.WhatsApp = validator.Phone(req.Contacts.WhatsApp)
	if err := validator.Length(req.Name, "name", 2, 80); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	req.OwnerID = auth.UserFromRequest(r).ID
	store, err := h.repo.CreateStore(r.Context(), req)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "could not create store")
		return
	}
	_ = h.repo.AddAuditLog(r.Context(), platform.AuditLog{UserID: req.OwnerID, Action: "store.created", EntityType: "store", EntityID: store.ID})
	httpx.JSON(w, http.StatusCreated, store)
}

func (h Handler) ListMine(w http.ResponseWriter, r *http.Request) {
	user := auth.UserFromRequest(r)
	page, limit := httpx.Page(r)
	stores, total, err := h.repo.StoresByOwner(r.Context(), user.ID, limit, httpx.Offset(page, limit))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not load stores")
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.ListResponse{Data: stores, Meta: httpx.Pagination{Page: page, Limit: limit, Total: total}})
}

func (h Handler) Get(w http.ResponseWriter, r *http.Request) {
	store, err := h.repo.StoreByID(r.Context(), r.PathValue("id"))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusNotFound, "not_found", "store not found")
		return
	}
	httpx.JSON(w, http.StatusOK, store)
}

func (h Handler) PublicStore(w http.ResponseWriter, r *http.Request) {
	store, err := h.repo.StoreBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusNotFound, "not_found", "store not found")
		return
	}
	products, _, _ := h.repo.ProductsByStore(r.Context(), store.ID, 24, 0)
	httpx.JSON(w, http.StatusOK, map[string]any{
		"store":    store,
		"products": products,
		"seo": map[string]string{
			"title":       store.Name + " - магазин на Bazar AI",
			"description": store.Description,
		},
	})
}
