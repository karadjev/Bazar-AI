package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type Service struct {
	apiURL string
	apiKey string
	model  string
	http   *http.Client
}

func NewService(apiURL, apiKey, model string) Service {
	return Service{apiURL: apiURL, apiKey: apiKey, model: model, http: &http.Client{Timeout: 30 * time.Second}}
}

func (s Service) Generate(ctx context.Context, task, input string) (string, string, error) {
	if s.apiURL == "" || s.apiKey == "" {
		return templateGenerate(task, input), "bazar-ai-template-v1", nil
	}
	payload := map[string]any{
		"model": s.model,
		"messages": []map[string]string{
			{"role": "system", "content": "Ты AI-помощник SaaS BuildYourStore.ai (кодовое имя Bazar AI). Пиши коротко, продающе и по-русски для малого бизнеса на Кавказе."},
			{"role": "user", "content": prompt(task, input)},
		},
	}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, strings.TrimRight(s.apiURL, "/")+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", "", err
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := s.http.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()
	var decoded struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&decoded); err != nil {
		return "", "", err
	}
	if resp.StatusCode >= 300 || len(decoded.Choices) == 0 {
		return "", "", fmt.Errorf("ai provider failed: %s", resp.Status)
	}
	return decoded.Choices[0].Message.Content, s.model, nil
}

func prompt(task, input string) string {
	switch task {
	case "store":
		return "Сгенерируй название магазина, hero-текст, блок о нас и FAQ. Данные: " + input
	case "product":
		return "Сгенерируй продающее описание товара, преимущества и короткий текст для карточки. Данные: " + input
	case "seo":
		return "Сгенерируй SEO title, SEO description и Open Graph текст. Данные: " + input
	case "marketing":
		return "Сгенерируй пост для Instagram, пост для Telegram и короткий WhatsApp текст. Данные: " + input
	default:
		return input
	}
}

func templateGenerate(task, input string) string {
	name := titleFromInput(input)
	switch task {
	case "store":
		return fmt.Sprintf("Название: %s Market\nHero: Локальный магазин, готовый к продажам сегодня.\nО нас: Мы помогаем быстро заказать качественные товары с доставкой по Кавказу.", name)
	case "product":
		return "Описание товара: " + input + ". Подчеркните качество, удобство заказа через Telegram/WhatsApp и быструю локальную доставку."
	case "seo":
		return "SEO title: Купить " + name + " с доставкой\nSEO description: Онлайн-заказ, понятные условия доставки и быстрый контакт с продавцом."
	case "marketing":
		return "Пост для Instagram/Telegram: Новинка уже в наличии. " + input + ". Напишите нам, и мы поможем оформить заказ сегодня."
	default:
		return input
	}
}
