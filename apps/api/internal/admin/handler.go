package admin

import (
	"net/http"

	"bazar-ai/apps/api/internal/platform"
	"bazar-ai/apps/api/pkg/httpx"
)

type Handler struct {
	repo *platform.Repository
}

func NewHandler(repo *platform.Repository) Handler {
	return Handler{repo: repo}
}

func (h Handler) Stats(w http.ResponseWriter, r *http.Request) {
	stores, err := h.repo.Stores(r.Context())
	if err != nil {
		httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "could not load stats")
		return
	}
	var orders int
	var gmv int64
	for _, store := range stores {
		storeOrders, _, _ := h.repo.OrdersByStore(r.Context(), store.ID, 100, 0)
		for _, order := range storeOrders {
			orders++
			gmv += order.TotalAmount
		}
	}
	httpx.JSON(w, http.StatusOK, map[string]any{
		"stores":        len(stores),
		"active_stores": len(stores),
		"orders":        orders,
		"gmv":           gmv,
		"mrr":           0,
		"ai_usage":      "logged",
	})
}
