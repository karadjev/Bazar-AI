package products

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

type errorEnvelope struct {
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

func TestCreateRejectsInvalidPayload(t *testing.T) {
	t.Parallel()

	handler := NewHandler(nil)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/stores/not-a-uuid/products", bytes.NewBufferString("{"))
	req.SetPathValue("storeID", "not-a-uuid")
	rec := httptest.NewRecorder()

	handler.Create(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
	var payload errorEnvelope
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("could not parse error payload: %v", err)
	}
	if payload.Error.Code != "validation_error" {
		t.Fatalf("expected validation_error code, got %q", payload.Error.Code)
	}
}

func TestCreateRejectsMissingTitle(t *testing.T) {
	t.Parallel()

	handler := NewHandler(nil)
	body := map[string]any{
		"description": "desc",
		"price":       100,
	}
	data, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/stores/00000000-0000-0000-0000-000000000000/products", bytes.NewReader(data))
	req.SetPathValue("storeID", "00000000-0000-0000-0000-000000000000")
	rec := httptest.NewRecorder()

	handler.Create(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
	var payload errorEnvelope
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("could not parse error payload: %v", err)
	}
	if payload.Error.Code != "validation_error" {
		t.Fatalf("expected validation_error code, got %q", payload.Error.Code)
	}
}

func TestCreateRejectsNonPositivePrice(t *testing.T) {
	t.Parallel()

	handler := NewHandler(nil)
	body := map[string]any{
		"title":       "Demo product",
		"description": "desc",
		"price":       0,
	}
	data, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/stores/00000000-0000-0000-0000-000000000000/products", bytes.NewReader(data))
	req.SetPathValue("storeID", "00000000-0000-0000-0000-000000000000")
	rec := httptest.NewRecorder()

	handler.Create(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
	var payload errorEnvelope
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("could not parse error payload: %v", err)
	}
	if payload.Error.Message != "price must be positive" {
		t.Fatalf("expected price validation message, got %q", payload.Error.Message)
	}
}
