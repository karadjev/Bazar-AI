package integration

import (
	"fmt"
	"net/http"
	"testing"
	"time"
)

func TestAPIFlow_RegisterOnboardingProductOrder(t *testing.T) {
	env := newIntegrationEnv(t)
	defer env.Close()

	email := fmt.Sprintf("integration-%d@bazar.ai", time.Now().UnixNano())
	authResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/register", map[string]string{
		"email":    email,
		"password": "alpha1234",
	}, nil, http.StatusOK)
	accessToken, _ := authResponse["access_token"].(string)
	if accessToken == "" {
		t.Fatal("expected access_token in register response")
	}

	onboardingResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/onboarding/complete", map[string]any{
		"niche":  "Парфюм",
		"name":   "Alpha Integration",
		"region": "Ингушетия",
		"city":   "Магас",
		"style":  "premium",
		"contacts": map[string]string{
			"phone":    "+79000000000",
			"whatsapp": "+79000000000",
		},
	}, map[string]string{"Authorization": "Bearer " + accessToken}, http.StatusCreated)

	storeMap, _ := onboardingResponse["store"].(map[string]any)
	storeID, _ := storeMap["id"].(string)
	storeSlug, _ := storeMap["slug"].(string)
	if storeID == "" || storeSlug == "" {
		t.Fatalf("expected created store id and slug, got id=%q slug=%q", storeID, storeSlug)
	}

	productResponse := postJSON[map[string]any](t, fmt.Sprintf("%s/api/v1/stores/%s/products", env.baseURL, storeID), map[string]any{
		"title":             "Alpha Oud 50ml",
		"description":       "Integration test product",
		"short_description": "Alpha aroma",
		"price":             450000,
		"currency":          "RUB",
		"stock_quantity":    5,
	}, map[string]string{"Authorization": "Bearer " + accessToken}, http.StatusCreated)
	productID, _ := productResponse["id"].(string)
	if productID == "" {
		t.Fatal("expected created product id")
	}

	publicStore := getJSON[map[string]any](t, fmt.Sprintf("%s/api/v1/public/stores/%s", env.baseURL, storeSlug), nil, http.StatusOK)
	productsList, _ := publicStore["products"].([]any)
	if len(productsList) == 0 {
		t.Fatal("expected public store to contain products")
	}

	orderResponse := postJSON[map[string]any](t, fmt.Sprintf("%s/api/v1/public/stores/%s/orders", env.baseURL, storeSlug), map[string]any{
		"customer_name":  "Адам",
		"customer_phone": "+79001112233",
		"customer_city":  "Магас",
		"items": []map[string]any{{
			"product_id": productID,
			"title":      "Alpha Oud 50ml",
			"quantity":   1,
			"price":      450000,
		}},
	}, nil, http.StatusCreated)
	orderID, _ := orderResponse["id"].(string)
	if orderID == "" {
		t.Fatal("expected created order id")
	}

	ordersResponse := getJSON[map[string]any](t, fmt.Sprintf("%s/api/v1/stores/%s/orders", env.baseURL, storeID), map[string]string{
		"Authorization": "Bearer " + accessToken,
	}, http.StatusOK)
	rawOrders, _ := ordersResponse["data"].([]any)
	if len(rawOrders) == 0 {
		t.Fatal("expected orders list to contain at least one order")
	}

	notifications := getJSON[[]map[string]any](t, fmt.Sprintf("%s/api/v1/orders/%s/notifications", env.baseURL, orderID), map[string]string{
		"Authorization": "Bearer " + accessToken,
	}, http.StatusOK)
	if len(notifications) == 0 {
		t.Fatal("expected at least one queued notification")
	}
}

func TestOnboardingFreePlanAllowsOnlyOneStore(t *testing.T) {
	env := newIntegrationEnv(t)
	defer env.Close()

	email := fmt.Sprintf("integration-limit-%d@bazar.ai", time.Now().UnixNano())
	authResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/register", map[string]string{
		"email":    email,
		"password": "alpha1234",
	}, nil, http.StatusOK)
	accessToken, _ := authResponse["access_token"].(string)
	if accessToken == "" {
		t.Fatal("expected access_token in register response")
	}

	headers := map[string]string{"Authorization": "Bearer " + accessToken}
	postJSON[map[string]any](t, env.baseURL+"/api/v1/onboarding/complete", map[string]any{
		"niche":  "Парфюм",
		"name":   "First Store",
		"region": "Ингушетия",
		"city":   "Магас",
		"style":  "premium",
	}, headers, http.StatusCreated)

	secondStore := postJSON[map[string]any](t, env.baseURL+"/api/v1/onboarding/complete", map[string]any{
		"niche":  "Косметика",
		"name":   "Second Store",
		"region": "Ингушетия",
		"city":   "Назрань",
		"style":  "beauty",
	}, headers, http.StatusPaymentRequired)

	errorPayload, ok := secondStore["error"].(map[string]any)
	if !ok {
		t.Fatalf("expected error object, got %+v", secondStore)
	}
	code, _ := errorPayload["code"].(string)
	if code != "request_error" {
		t.Fatalf("expected request_error code for payment required, got %q", code)
	}
}

func TestPublicOrderIdempotencyPreventsDuplicates(t *testing.T) {
	env := newIntegrationEnv(t)
	defer env.Close()

	email := fmt.Sprintf("integration-idem-%d@bazar.ai", time.Now().UnixNano())
	authResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/register", map[string]string{
		"email":    email,
		"password": "alpha1234",
	}, nil, http.StatusOK)
	accessToken, _ := authResponse["access_token"].(string)
	if accessToken == "" {
		t.Fatal("expected access_token in register response")
	}
	headers := map[string]string{"Authorization": "Bearer " + accessToken}

	onboardingResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/onboarding/complete", map[string]any{
		"niche":  "Парфюм",
		"name":   "Idempotency Store",
		"region": "Ингушетия",
		"city":   "Магас",
		"style":  "premium",
	}, headers, http.StatusCreated)
	storeMap, _ := onboardingResponse["store"].(map[string]any)
	storeID, _ := storeMap["id"].(string)
	storeSlug, _ := storeMap["slug"].(string)
	if storeID == "" || storeSlug == "" {
		t.Fatalf("expected created store id and slug, got id=%q slug=%q", storeID, storeSlug)
	}

	productResponse := postJSON[map[string]any](t, fmt.Sprintf("%s/api/v1/stores/%s/products", env.baseURL, storeID), map[string]any{
		"title":             "Idempotency Product",
		"description":       "Product for idempotency test",
		"short_description": "Idempotency",
		"price":             199000,
		"currency":          "RUB",
		"stock_quantity":    5,
	}, headers, http.StatusCreated)
	productID, _ := productResponse["id"].(string)
	if productID == "" {
		t.Fatal("expected created product id")
	}

	orderPayload := map[string]any{
		"customer_name":  "Адам",
		"customer_phone": "+79001112233",
		"customer_city":  "Магас",
		"items": []map[string]any{{
			"product_id": productID,
			"title":      "Idempotency Product",
			"quantity":   1,
			"price":      199000,
		}},
	}
	idempotencyHeaders := map[string]string{"Idempotency-Key": "fixed-order-key-1"}

	first := postJSON[map[string]any](t, fmt.Sprintf("%s/api/v1/public/stores/%s/orders", env.baseURL, storeSlug), orderPayload, idempotencyHeaders, http.StatusCreated)
	second := postJSON[map[string]any](t, fmt.Sprintf("%s/api/v1/public/stores/%s/orders", env.baseURL, storeSlug), orderPayload, idempotencyHeaders, http.StatusCreated)

	firstID, _ := first["id"].(string)
	secondID, _ := second["id"].(string)
	if firstID == "" || secondID == "" {
		t.Fatalf("expected non-empty order IDs, got first=%q second=%q", firstID, secondID)
	}
	if firstID != secondID {
		t.Fatalf("expected same order id for idempotent retries, got first=%q second=%q", firstID, secondID)
	}

	ordersResponse := getJSON[map[string]any](t, fmt.Sprintf("%s/api/v1/stores/%s/orders", env.baseURL, storeID), headers, http.StatusOK)
	rawOrders, _ := ordersResponse["data"].([]any)
	found := 0
	for _, item := range rawOrders {
		order, _ := item.(map[string]any)
		if orderID, _ := order["id"].(string); orderID == firstID {
			found++
		}
	}
	if found != 1 {
		t.Fatalf("expected exactly one order with id %q, found %d", firstID, found)
	}
}

func TestRefreshTokenRotationInvalidatesOldToken(t *testing.T) {
	env := newIntegrationEnv(t)
	defer env.Close()

	email := fmt.Sprintf("integration-refresh-%d@bazar.ai", time.Now().UnixNano())
	registerResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/register", map[string]string{
		"email":    email,
		"password": "alpha1234",
	}, nil, http.StatusOK)

	originalRefresh, _ := registerResponse["refresh_token"].(string)
	if originalRefresh == "" {
		t.Fatal("expected refresh_token in register response")
	}

	firstRefreshResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/refresh", map[string]string{
		"refresh_token": originalRefresh,
		"device_id":     "ios-demo",
	}, nil, http.StatusOK)
	newRefresh, _ := firstRefreshResponse["refresh_token"].(string)
	if newRefresh == "" {
		t.Fatal("expected new refresh token after rotation")
	}
	if newRefresh == originalRefresh {
		t.Fatal("expected refresh token to rotate to a new value")
	}

	oldTokenAttempt := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/refresh", map[string]string{
		"refresh_token": originalRefresh,
		"device_id":     "ios-demo",
	}, nil, http.StatusUnauthorized)
	oldTokenError, _ := oldTokenAttempt["error"].(map[string]any)
	oldTokenCode, _ := oldTokenError["code"].(string)
	if oldTokenCode != "unauthorized" {
		t.Fatalf("expected unauthorized for old refresh token reuse, got %q", oldTokenCode)
	}

	secondRefreshResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/refresh", map[string]string{
		"refresh_token": newRefresh,
		"device_id":     "ios-demo",
	}, nil, http.StatusOK)
	secondRefresh, _ := secondRefreshResponse["refresh_token"].(string)
	if secondRefresh == "" {
		t.Fatal("expected second refresh token for chained rotation")
	}
}

func TestLogoutRevokesRefreshToken(t *testing.T) {
	env := newIntegrationEnv(t)
	defer env.Close()

	email := fmt.Sprintf("integration-logout-%d@bazar.ai", time.Now().UnixNano())
	registerResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/register", map[string]string{
		"email":    email,
		"password": "alpha1234",
	}, nil, http.StatusOK)
	refreshToken, _ := registerResponse["refresh_token"].(string)
	if refreshToken == "" {
		t.Fatal("expected refresh_token in register response")
	}

	logoutResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/logout", map[string]string{
		"refresh_token": refreshToken,
	}, nil, http.StatusOK)
	status, _ := logoutResponse["status"].(string)
	if status != "logged_out" {
		t.Fatalf("expected logged_out status, got %q", status)
	}

	reuseAttempt := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/refresh", map[string]string{
		"refresh_token": refreshToken,
	}, nil, http.StatusUnauthorized)
	errPayload, _ := reuseAttempt["error"].(map[string]any)
	code, _ := errPayload["code"].(string)
	if code != "unauthorized" {
		t.Fatalf("expected unauthorized for revoked refresh token, got %q", code)
	}
}

func TestLogoutAllRevokesAllSessions(t *testing.T) {
	env := newIntegrationEnv(t)
	defer env.Close()

	email := fmt.Sprintf("integration-logout-all-%d@bazar.ai", time.Now().UnixNano())
	registerResponse := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/register", map[string]string{
		"email":    email,
		"password": "alpha1234",
	}, nil, http.StatusOK)
	accessToken, _ := registerResponse["access_token"].(string)
	firstRefreshToken, _ := registerResponse["refresh_token"].(string)
	if accessToken == "" || firstRefreshToken == "" {
		t.Fatal("expected access_token and refresh_token in register response")
	}

	secondSession := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/refresh", map[string]string{
		"refresh_token": firstRefreshToken,
		"device_id":     "android",
	}, nil, http.StatusOK)
	secondRefreshToken, _ := secondSession["refresh_token"].(string)
	if secondRefreshToken == "" {
		t.Fatal("expected rotated refresh token")
	}

	logoutAll := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/logout-all", map[string]any{}, map[string]string{
		"Authorization": "Bearer " + accessToken,
	}, http.StatusOK)
	status, _ := logoutAll["status"].(string)
	if status != "logged_out" {
		t.Fatalf("expected logged_out status for logout-all, got %q", status)
	}

	for _, token := range []string{firstRefreshToken, secondRefreshToken} {
		reuseAttempt := postJSON[map[string]any](t, env.baseURL+"/api/v1/auth/refresh", map[string]string{
			"refresh_token": token,
		}, nil, http.StatusUnauthorized)
		errPayload, _ := reuseAttempt["error"].(map[string]any)
		code, _ := errPayload["code"].(string)
		if code != "unauthorized" {
			t.Fatalf("expected unauthorized for token %q after logout-all, got %q", token, code)
		}
	}
}
