package telegram

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"bazar-ai/apps/api/internal/platform"
)

type Notifier interface {
	SendOrder(ctx context.Context, store platform.Store, order platform.Order, orderURL string) error
}

type BotNotifier struct {
	token string
	http  *http.Client
}

func NewBotNotifier(token string) BotNotifier {
	return BotNotifier{token: token, http: &http.Client{Timeout: 8 * time.Second}}
}

func (n BotNotifier) SendOrder(ctx context.Context, store platform.Store, order platform.Order, orderURL string) error {
	if n.token == "" || store.Contacts.Telegram == "" {
		return nil
	}
	chatID := store.Contacts.Telegram
	text := fmt.Sprintf("Новый заказ\nКлиент: %s\nТелефон: %s\nТовары: %s\nСумма: %.2f ₽", order.CustomerName, order.CustomerPhone, orderItems(order.Items), float64(order.TotalAmount)/100)
	payload := map[string]any{
		"chat_id": chatID,
		"text":    text,
		"reply_markup": map[string]any{
			"inline_keyboard": [][]map[string]string{{
				{"text": "Открыть заказ", "url": orderURL},
			}},
		},
	}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.telegram.org/bot"+n.token+"/sendMessage", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := n.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("telegram sendMessage failed: %s", resp.Status)
	}
	return nil
}

func orderItems(items []platform.OrderItem) string {
	parts := make([]string, 0, len(items))
	for _, item := range items {
		title := item.Title
		if title == "" {
			title = item.ProductID
		}
		parts = append(parts, fmt.Sprintf("%s x%d", title, item.Quantity))
	}
	return strings.Join(parts, ", ")
}
