package sprint

import (
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

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
		httpx.RespondDecodeError(w, r, err, "invalid payload")
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
	if req.Region == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "region is required")
		return
	}
	if err := validator.Length(req.Region, "region", 2, 80); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	if req.Contacts.Phone == "" && req.Contacts.WhatsApp == "" && req.Contacts.Telegram == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "at least one contact is required")
		return
	}
	if req.Contacts.Telegram != "" && !strings.HasPrefix(req.Contacts.Telegram, "@") {
		req.Contacts.Telegram = "@" + req.Contacts.Telegram
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
		httpx.RespondInfraError(w, r, err, "could not create store")
		return
	}
	httpx.JSON(w, http.StatusCreated, map[string]any{"store": store, "guest_mode": isGuestMode(r)})
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
	sort.SliceStable(leads, func(i, j int) bool { return leads[i].CreatedAt.After(leads[j].CreatedAt) })
	httpx.JSON(w, http.StatusOK, map[string]any{"data": leads, "meta": map[string]int{"total": len(leads)}})
}

func (h Handler) UpdateLeadStatus(w http.ResponseWriter, r *http.Request) {
	ownerID := resolveOwnerID(r)
	if ownerID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing owner context")
		return
	}
	leadID := validator.Text(r.PathValue("id"), 64)
	if leadID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "lead id is required")
		return
	}
	var req struct {
		Status string `json:"status"`
	}
	if err := httpx.Decode(r, &req); err != nil {
		httpx.RespondDecodeError(w, r, err, "invalid payload")
		return
	}
	req.Status = strings.ToLower(validator.Text(req.Status, 24))
	if err := validator.Enum(req.Status, "status", "new", "contacted", "closed"); err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	lead, err := h.repo.UpdateLeadStatusByOwner(r.Context(), leadID, ownerID, req.Status)
	if err != nil {
		httpx.RespondInfraError(w, r, err, "lead not found")
		return
	}
	history, _ := h.repo.LeadStatusHistoryByOwner(r.Context(), leadID, ownerID)
	lead.StatusHistory = history
	httpx.JSON(w, http.StatusOK, lead)
}

func (h Handler) LeadDetails(w http.ResponseWriter, r *http.Request) {
	ownerID := resolveOwnerID(r)
	if ownerID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing owner context")
		return
	}
	leadID := validator.Text(r.PathValue("id"), 64)
	if leadID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "lead id is required")
		return
	}
	lead, err := h.repo.LeadByIDByOwner(r.Context(), leadID, ownerID)
	if err != nil {
		httpx.RespondInfraError(w, r, err, "lead not found")
		return
	}
	history, _ := h.repo.LeadStatusHistoryByOwner(r.Context(), leadID, ownerID)
	lead.StatusHistory = history
	httpx.JSON(w, http.StatusOK, lead)
}

func (h Handler) UpdateLeadComment(w http.ResponseWriter, r *http.Request) {
	ownerID := resolveOwnerID(r)
	if ownerID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing owner context")
		return
	}
	leadID := validator.Text(r.PathValue("id"), 64)
	if leadID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "lead id is required")
		return
	}
	var req struct {
		Comment string `json:"comment"`
	}
	if err := httpx.Decode(r, &req); err != nil {
		httpx.RespondDecodeError(w, r, err, "invalid payload")
		return
	}
	req.Comment = validator.Text(req.Comment, 1000)
	lead, err := h.repo.UpdateLeadCommentByOwner(r.Context(), leadID, ownerID, req.Comment)
	if err != nil {
		httpx.RespondInfraError(w, r, err, "lead not found")
		return
	}
	history, _ := h.repo.LeadStatusHistoryByOwner(r.Context(), leadID, ownerID)
	lead.StatusHistory = history
	httpx.JSON(w, http.StatusOK, lead)
}

func (h Handler) DashboardAnalytics(w http.ResponseWriter, r *http.Request) {
	ownerID := resolveOwnerID(r)
	if ownerID == "" {
		httpx.ErrorWithRequest(w, r, http.StatusUnauthorized, "unauthorized", "missing owner context")
		return
	}
	stores, _, err := h.repo.StoresByOwner(r.Context(), ownerID, 100, 0)
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not load stores")
		return
	}
	period := 7
	if raw := strings.TrimSpace(r.URL.Query().Get("period")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && (parsed == 7 || parsed == 30 || parsed == 90) {
			period = parsed
		}
	}
	start := time.Now().AddDate(0, 0, -(period - 1))
	timeline := make([]map[string]any, 0, period)
	series := map[string]map[string]int64{}
	for i := 0; i < period; i++ {
		day := start.AddDate(0, 0, i).Format("2006-01-02")
		timeline = append(timeline, map[string]any{"date": day, "leads": 0, "orders": 0, "gmv": 0})
		series[day] = map[string]int64{"leads": 0, "orders": 0, "gmv": 0}
	}
	var leadsTotal int
	var ordersTotal int
	var gmvTotal int64
	for _, store := range stores {
		storeLeads, _, leadErr := h.repo.LeadsByStore(r.Context(), store.ID, 500, 0)
		if leadErr == nil {
			leadsTotal += len(storeLeads)
			for _, lead := range storeLeads {
				day := lead.CreatedAt.Format("2006-01-02")
				if bucket, ok := series[day]; ok {
					bucket["leads"]++
				}
			}
		}
		storeOrders, _, orderErr := h.repo.OrdersByStore(r.Context(), store.ID, 500, 0)
		if orderErr == nil {
			ordersTotal += len(storeOrders)
			for _, order := range storeOrders {
				gmvTotal += order.TotalAmount
				day := order.CreatedAt.Format("2006-01-02")
				if bucket, ok := series[day]; ok {
					bucket["orders"]++
					bucket["gmv"] += order.TotalAmount
				}
			}
		}
	}
	for _, point := range timeline {
		day := point["date"].(string)
		if bucket, ok := series[day]; ok {
			point["leads"] = bucket["leads"]
			point["orders"] = bucket["orders"]
			point["gmv"] = bucket["gmv"]
		}
	}
	httpx.JSON(w, http.StatusOK, map[string]any{
		"data": map[string]any{
			"stores": len(stores),
			"leads":  leadsTotal,
			"orders": ordersTotal,
			"gmv":    gmvTotal,
			"period": period,
			"series": timeline,
		},
	})
}

func (h Handler) StoreBySlug(w http.ResponseWriter, r *http.Request) {
	store, err := h.repo.StoreBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		httpx.RespondInfraError(w, r, err, "store not found")
		return
	}
	products, _, _ := h.repo.ProductsByStore(r.Context(), store.ID, 24, 0)
	httpx.JSON(w, http.StatusOK, map[string]any{"store": store, "products": products})
}

func (h Handler) CreateLead(w http.ResponseWriter, r *http.Request) {
	store, err := h.repo.StoreBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		httpx.RespondInfraError(w, r, err, "store not found")
		return
	}
	var req struct {
		CustomerName string `json:"customerName"`
		Phone        string `json:"phone"`
		Message      string `json:"message"`
	}
	if err := httpx.Decode(r, &req); err != nil {
		httpx.RespondDecodeError(w, r, err, "invalid lead payload")
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
	if digitsOnly(phone) < 7 {
		httpx.ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", "phone is invalid")
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

func digitsOnly(value string) int {
	count := 0
	for _, r := range value {
		if r >= '0' && r <= '9' {
			count++
		}
	}
	return count
}
