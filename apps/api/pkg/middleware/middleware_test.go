package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestStatusMetricsRecordsEndpointStatusAndClass(t *testing.T) {
	metrics := NewStatusMetrics()
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/products/{id}", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/products/123", nil)
	rec := httptest.NewRecorder()
	metrics.Middleware(mux).ServeHTTP(rec, req)

	metricsReq := httptest.NewRequest(http.MethodGet, "/metrics", nil)
	metricsRec := httptest.NewRecorder()
	metrics.Handler().ServeHTTP(metricsRec, metricsReq)

	body := metricsRec.Body.String()
	for _, want := range []string{
		`bazar_api_http_responses_total`,
		`method="GET"`,
		`endpoint="GET /api/v1/products/{id}"`,
		`status="404"`,
		`status_class="4xx"`,
		` 1`,
	} {
		if !strings.Contains(body, want) {
			t.Fatalf("metrics body = %q, want it to contain %q", body, want)
		}
	}
}

func TestStatusMetricsDefaultsImplicitWriteTo200(t *testing.T) {
	metrics := NewStatusMetrics()
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("ok"))
	})

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	metrics.Middleware(handler).ServeHTTP(rec, req)

	metricsReq := httptest.NewRequest(http.MethodGet, "/metrics", nil)
	metricsRec := httptest.NewRecorder()
	metrics.Handler().ServeHTTP(metricsRec, metricsReq)

	body := metricsRec.Body.String()
	if !strings.Contains(body, `status="200"`) || !strings.Contains(body, `status_class="2xx"`) {
		t.Fatalf("metrics body = %q, want implicit 200 response metrics", body)
	}
}
