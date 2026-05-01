package httpx

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestErrorUsesStandardEnvelopeAndRequestID(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/example", nil)
	req.Header.Set("X-Request-Id", "req_123")
	rec := httptest.NewRecorder()

	ErrorWithRequest(rec, req, http.StatusPaymentRequired, "quota_exceeded", "limit reached")

	if rec.Code != http.StatusPaymentRequired {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusPaymentRequired)
	}
	var body ErrorResponse
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode error response: %v", err)
	}
	if body.Error.Code != "quota_exceeded" {
		t.Fatalf("code = %q, want quota_exceeded", body.Error.Code)
	}
	if body.Error.Message != "limit reached" {
		t.Fatalf("message = %q, want limit reached", body.Error.Message)
	}
	if body.Error.RequestID != "req_123" {
		t.Fatalf("request_id = %q, want req_123", body.Error.RequestID)
	}
}

func TestErrorCodeForStatus(t *testing.T) {
	tests := []struct {
		status int
		want   string
	}{
		{status: http.StatusBadRequest, want: "validation_error"},
		{status: http.StatusConflict, want: "conflict"},
		{status: http.StatusPaymentRequired, want: "quota_exceeded"},
		{status: http.StatusTooManyRequests, want: "rate_limited"},
		{status: http.StatusBadGateway, want: "upstream_error"},
		{status: http.StatusInternalServerError, want: "internal_error"},
	}

	for _, tt := range tests {
		if got := codeForStatus(tt.status); got != tt.want {
			t.Fatalf("codeForStatus(%d) = %q, want %q", tt.status, got, tt.want)
		}
	}
}
