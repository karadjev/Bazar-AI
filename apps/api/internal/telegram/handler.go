package telegram

import (
	"fmt"
	"net/http"
	"strings"

	"bazar-ai/apps/api/internal/auth"
	"bazar-ai/apps/api/internal/platform"
	"bazar-ai/apps/api/pkg/httpx"
)

type Handler struct {
	repo     *platform.Repository
	notifier Notifier
}

func NewHandler(repo *platform.Repository, notifier Notifier) Handler {
	return Handler{repo: repo, notifier: notifier}
}

func (h Handler) ConnectCode(w http.ResponseWriter, r *http.Request) {
	user := auth.UserFromRequest(r)
	storeID := r.PathValue("storeID")
	connection, err := h.repo.CreateTelegramConnectCode(r.Context(), user.ID, storeID)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "could not create telegram connect code")
		return
	}
	httpx.JSON(w, http.StatusCreated, map[string]any{
		"code":        connection.Code,
		"expires_at":  connection.ExpiresAt,
		"instruction": "/start " + connection.Code,
	})
}

func (h Handler) Status(w http.ResponseWriter, r *http.Request) {
	connection, err := h.repo.TelegramStatus(r.Context(), r.PathValue("storeID"))
	if err != nil {
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "not_connected"})
		return
	}
	httpx.JSON(w, http.StatusOK, connection)
}

func (h Handler) Test(w http.ResponseWriter, r *http.Request) {
	store, err := h.repo.StoreByID(r.Context(), r.PathValue("storeID"))
	if err != nil {
		httpx.Error(w, http.StatusNotFound, "store not found")
		return
	}
	order := platform.Order{
		ID: "test", CustomerName: "Тестовый клиент", CustomerPhone: "+7 900 000-00-00",
		Items:       []platform.OrderItem{{Title: "Тестовый товар", Quantity: 1, Price: 100000, Total: 100000}},
		TotalAmount: 100000,
	}
	if err := h.notifier.SendOrder(r.Context(), store, order, "https://bazar.ai/dashboard/orders/test"); err != nil {
		httpx.Error(w, http.StatusBadGateway, "telegram test failed")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "sent"})
}

func (h Handler) Webhook(w http.ResponseWriter, r *http.Request) {
	var update struct {
		Message struct {
			Text string `json:"text"`
			Chat struct {
				ID int64 `json:"id"`
			} `json:"chat"`
			From struct {
				ID int64 `json:"id"`
			} `json:"from"`
		} `json:"message"`
	}
	if err := httpx.Decode(r, &update); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid telegram update")
		return
	}
	parts := strings.Fields(update.Message.Text)
	if len(parts) == 2 && parts[0] == "/start" {
		telegramID := fmt.Sprintf("%d", update.Message.Chat.ID)
		if telegramID == "0" {
			telegramID = fmt.Sprintf("%d", update.Message.From.ID)
		}
		if _, err := h.repo.BindTelegramCode(r.Context(), parts[1], telegramID); err != nil {
			httpx.Error(w, http.StatusNotFound, "connect code expired or invalid")
			return
		}
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "connected"})
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "ignored"})
}
