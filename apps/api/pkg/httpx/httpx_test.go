package httpx

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
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
		{status: http.StatusRequestEntityTooLarge, want: "payload_too_large"},
		{status: http.StatusBadGateway, want: "upstream_error"},
		{status: http.StatusInternalServerError, want: "internal_error"},
	}

	for _, tt := range tests {
		if got := codeForStatus(tt.status); got != tt.want {
			t.Fatalf("codeForStatus(%d) = %q, want %q", tt.status, got, tt.want)
		}
	}
}

func TestRespondDecodeErrorMapsMaxBytesTo413(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/example", nil)
	rec := httptest.NewRecorder()
	RespondDecodeError(rec, req, &http.MaxBytesError{Limit: 1024}, "ignored")

	if rec.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("status = %d, want 413", rec.Code)
	}
	var body ErrorResponse
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Error.Code != "payload_too_large" {
		t.Fatalf("code = %q", body.Error.Code)
	}
}

func TestRespondDecodeErrorOtherDecodeTo400(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/example", nil)
	rec := httptest.NewRecorder()
	RespondDecodeError(rec, req, errors.New("syntax"), "bad json")

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rec.Code)
	}
	var body ErrorResponse
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Error.Code != "validation_error" || body.Error.Message != "bad json" {
		t.Fatalf("error = %+v", body.Error)
	}
}

func TestDecodeRejectsTrailingJSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/example", strings.NewReader(`{"name":"ok"}{"name":"extra"}`))
	var payload struct {
		Name string `json:"name"`
	}

	if err := Decode(req, &payload); err == nil {
		t.Fatal("Decode() error = nil, want trailing JSON error")
	}
}

func TestRespondInfraErrorMapsKnownErrors(t *testing.T) {
	tests := []struct {
		name       string
		err        error
		wantStatus int
		wantCode   string
	}{
		{name: "not found", err: pgx.ErrNoRows, wantStatus: http.StatusNotFound, wantCode: "not_found"},
		{name: "conflict unique", err: &pgconn.PgError{Code: "23505"}, wantStatus: http.StatusConflict, wantCode: "conflict"},
		{name: "fk violation", err: &pgconn.PgError{Code: "23503"}, wantStatus: http.StatusBadRequest, wantCode: "validation_error"},
		{name: "data exception", err: &pgconn.PgError{Code: "22001"}, wantStatus: http.StatusBadRequest, wantCode: "validation_error"},
		{name: "fallback internal", err: errors.New("boom"), wantStatus: http.StatusInternalServerError, wantCode: "internal_error"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/example", nil)
			rec := httptest.NewRecorder()
			RespondInfraError(rec, req, tt.err, "fallback message")

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			var body ErrorResponse
			if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
				t.Fatalf("decode: %v", err)
			}
			if body.Error.Code != tt.wantCode {
				t.Fatalf("code = %q, want %q", body.Error.Code, tt.wantCode)
			}
			if body.Error.Message != "fallback message" {
				t.Fatalf("message = %q, want fallback message", body.Error.Message)
			}
		})
	}
}
