package orders

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"bazar-ai/apps/api/internal/platform"
	"bazar-ai/apps/api/internal/telegram"
	"bazar-ai/apps/api/pkg/httpx"
	"bazar-ai/apps/api/pkg/validator"
)

type Handler struct {
	repo     *platform.Repository
	notifier telegram.Notifier
	appURL   string
}

func NewHandler(repo *platform.Repository, notifier telegram.Notifier, appURL string) Handler {
	return Handler{repo: repo, notifier: notifier, appURL: appURL}
}

func (h Handler) CreatePublic(w http.ResponseWriter, r *http.Request) {
	store, err := h.repo.StoreBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusNotFound, "not_found", "store not found")
		return
	}
	var req platform.Order
	if err := httpx.Decode(r, &req); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "invalid order payload")
		return
	}
	req.StoreID = store.ID
	req.IdempotencyKey = strings.TrimSpace(r.Header.Get("Idempotency-Key"))
	req.CustomerName = validator.Text(req.CustomerName, 80)
	req.CustomerPhone = validator.Phone(req.CustomerPhone)
	req.CustomerCity = validator.Text(req.CustomerCity, 80)
	req.CustomerAddress = validator.Text(req.CustomerAddress, 200)
	req.Comment = validator.Text(req.Comment, 500)
	if err := validator.Length(req.CustomerName, "customer_name", 2, 80); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	if err := validator.Length(req.CustomerPhone, "customer_phone", 5, 30); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	order, err := h.repo.CreateOrder(r.Context(), req)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	payload, _ := json.Marshal(map[string]any{"order_id": order.ID, "customer": order.CustomerName, "total": order.TotalAmount})
	_, _ = h.repo.AddNotificationJob(r.Context(), platform.NotificationJob{StoreID: store.ID, OrderID: order.ID, Channel: "telegram", Status: "queued", Payload: string(payload)})
	_ = h.notifier.SendOrder(r.Context(), store, order, h.orderURL(order.ID))
	_ = h.repo.AddAuditLog(r.Context(), platform.AuditLog{Action: "order.created", EntityType: "order", EntityID: order.ID})
	httpx.JSON(w, http.StatusCreated, order)
}

func (h Handler) ListByStore(w http.ResponseWriter, r *http.Request) {
	page, limit := httpx.Page(r)
	orders, total, err := h.repo.OrdersByStore(r.Context(), r.PathValue("storeID"), limit, httpx.Offset(page, limit))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not load orders")
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.ListResponse{Data: orders, Meta: httpx.Pagination{Page: page, Limit: limit, Total: total}})
}

func (h Handler) NotificationsByOrder(w http.ResponseWriter, r *http.Request) {
	jobs, err := h.repo.NotificationJobsByOrder(r.Context(), r.PathValue("id"))
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not load notifications")
		return
	}
	httpx.JSON(w, http.StatusOK, jobs)
}

func (h Handler) orderURL(orderID string) string {
	return fmt.Sprintf("%s/dashboard/orders/%s", strings.TrimRight(h.appURL, "/"), orderID)
}
