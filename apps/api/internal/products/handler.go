package products

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
	var req platform.Product
	if err := httpx.Decode(r, &req); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "invalid product payload")
		return
	}
	req.StoreID = r.PathValue("storeID")
	req.Title = validator.Text(req.Title, 120)
	req.Description = validator.Text(req.Description, 4000)
	req.ShortDescription = validator.Text(req.ShortDescription, 280)
	if err := validator.UUID(req.StoreID, "store_id"); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	if err := validator.Length(req.Title, "title", 2, 120); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	if req.Price <= 0 {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "price must be positive")
		return
	}
	if req.Status == "" {
		req.Status = "active"
	}
	if err := validator.Enum(req.Status, "status", "draft", "active", "archived"); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	limits, _ := h.repo.TariffLimitsByStore(r.Context(), req.StoreID)
	count, err := h.repo.ProductCountByStore(r.Context(), req.StoreID)
	if err == nil && count >= limits.ProductLimit {
		httpx.ErrorWithRequest(w, r, http.StatusPaymentRequired, "quota_exceeded", "product limit exceeded for tariff "+limits.Code)
		return
	}
	product, err := h.repo.CreateProduct(r.Context(), req)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "could not create product")
		return
	}
	_ = h.repo.AddAuditLog(r.Context(), platform.AuditLog{UserID: auth.UserFromRequest(r).ID, Action: "product.created", EntityType: "product", EntityID: product.ID})
	httpx.JSON(w, http.StatusCreated, product)
}

func (h Handler) ListByStore(w http.ResponseWriter, r *http.Request) {
	page, limit := httpx.Page(r)
	products, total, err := h.repo.ProductsByStore(r.Context(), r.PathValue("storeID"), limit, httpx.Offset(page, limit))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not load products")
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.ListResponse{Data: products, Meta: httpx.Pagination{Page: page, Limit: limit, Total: total}})
}

func (h Handler) Get(w http.ResponseWriter, r *http.Request) {
	product, err := h.repo.ProductByID(r.Context(), r.PathValue("id"))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusNotFound, "not_found", "product not found")
		return
	}
	httpx.JSON(w, http.StatusOK, product)
}
