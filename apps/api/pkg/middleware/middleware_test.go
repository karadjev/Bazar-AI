package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"bazar-ai/apps/api/pkg/httpx"
)

func mustParseNet(t *testing.T, cidr string) *net.IPNet {
	t.Helper()
	_, n, err := net.ParseCIDR(cidr)
	if err != nil {
		t.Fatal(err)
	}
	return n
}

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

func TestClientIPPrefersTrustedRealIP(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/example", nil)
	req.RemoteAddr = "10.0.0.10:1234"
	req.Header.Set("X-Forwarded-For", "198.51.100.10, 203.0.113.20")
	req.Header.Set("X-Real-IP", "203.0.113.7")

	trusted := []*net.IPNet{mustParseNet(t, "10.0.0.0/8")}
	if got := ClientIP(req, trusted); got != "203.0.113.7" {
		t.Fatalf("ClientIP() = %q, want X-Real-IP", got)
	}
}

func TestRecoverPanicReturns500JSON(t *testing.T) {
	handler := RecoverPanic(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("boom")
	}))

	req := httptest.NewRequest(http.MethodGet, "/panic", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500", rec.Code)
	}
	if got := rec.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control = %q, want no-store", got)
	}
	var body map[string]any
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	errObj, _ := body["error"].(map[string]any)
	if errObj["code"] != "internal_error" {
		t.Fatalf("error.code = %v", errObj["code"])
	}
}

func TestMaxRequestBodyRejectsOversizeJSON(t *testing.T) {
	lim := MaxRequestBody(64)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		buf := make([]byte, 128)
		_, err := io.ReadFull(r.Body, buf)
		if err != nil {
			httpx.RespondDecodeError(w, r, err, "read failed")
			return
		}
		w.WriteHeader(http.StatusOK)
	}))

	body := bytes.Repeat([]byte("a"), 200)
	req := httptest.NewRequest(http.MethodPost, "/x", bytes.NewReader(body))
	req.ContentLength = int64(len(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	lim.ServeHTTP(rec, req)

	if rec.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("status = %d, want 413", rec.Code)
	}
}

func TestMaxRequestBodySkipsMultipart(t *testing.T) {
	lim := MaxRequestBody(10)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodPost, "/up", http.NoBody)
	req.Header.Set("Content-Type", "multipart/form-data; boundary=x")
	rec := httptest.NewRecorder()
	lim.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
}

func TestSecurityHeaders(t *testing.T) {
	h := SecurityHeaders(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Fatal("missing X-Content-Type-Options")
	}
	if rec.Header().Get("X-Frame-Options") != "DENY" {
		t.Fatal("missing X-Frame-Options")
	}
	if rec.Header().Get("Referrer-Policy") != "strict-origin-when-cross-origin" {
		t.Fatal("missing Referrer-Policy")
	}
	if rec.Header().Get("Permissions-Policy") != "camera=(), microphone=(), geolocation=()" {
		t.Fatal("missing Permissions-Policy")
	}
}

func TestClientIPUsesFirstValidForwardedIP(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/example", nil)
	req.RemoteAddr = "10.0.0.10:1234"
	req.Header.Set("X-Forwarded-For", "bad value, 198.51.100.10, 203.0.113.20")

	trusted := []*net.IPNet{mustParseNet(t, "10.0.0.0/8")}
	if got := ClientIP(req, trusted); got != "198.51.100.10" {
		t.Fatalf("ClientIP() = %q, want first valid forwarded IP", got)
	}
}

func TestClientIPIgnoresForwardedWhenPeerNotTrusted(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/example", nil)
	req.RemoteAddr = "198.51.100.5:443"
	req.Header.Set("X-Forwarded-For", "1.2.3.4")
	req.Header.Set("X-Real-IP", "5.6.7.8")

	trusted := []*net.IPNet{mustParseNet(t, "10.0.0.0/8")}
	if got := ClientIP(req, trusted); got != "198.51.100.5" {
		t.Fatalf("ClientIP() = %q, want direct RemoteAddr when peer is not trusted", got)
	}
}

func TestClientIPNeverTrustsHeadersWhenDirectMode(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/example", nil)
	req.RemoteAddr = "10.0.0.10:1234"
	req.Header.Set("X-Real-IP", "203.0.113.7")

	if got := ClientIP(req, nil); got != "10.0.0.10" {
		t.Fatalf("ClientIP() = %q, want RemoteAddr in direct mode", got)
	}
}

func TestClientIPSupportsIPv6TrustedProxy(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/example", nil)
	req.RemoteAddr = "[2001:db8::1]:443"
	req.Header.Set("X-Real-IP", "2001:db8::99")

	trusted := []*net.IPNet{mustParseNet(t, "2001:db8::/32")}
	if got := ClientIP(req, trusted); got != "2001:db8::99" {
		t.Fatalf("ClientIP() = %q, want trusted IPv6 X-Real-IP", got)
	}
}

func TestClientIPLoopbackWithoutTrustUsesRemoteAddr(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/example", nil)
	req.RemoteAddr = "127.0.0.1:1234"
	req.Header.Set("X-Forwarded-For", "198.51.100.10")

	if got := ClientIP(req, nil); got != "127.0.0.1" {
		t.Fatalf("ClientIP() = %q, want loopback remote addr in direct mode", got)
	}
}

func TestRequestIDUsesHeaderWhenValid(t *testing.T) {
	handler := RequestID(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("X-Request-Id", "test-request-id-123")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if got := rec.Header().Get("X-Request-Id"); got != "test-request-id-123" {
		t.Fatalf("X-Request-Id = %q, want preserved header value", got)
	}
}

func TestRequestIDReplacesInvalidHeader(t *testing.T) {
	handler := RequestID(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("X-Request-Id", "bad\nid")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	got := rec.Header().Get("X-Request-Id")
	if got == "" {
		t.Fatal("expected generated X-Request-Id")
	}
	if got == "bad\nid" {
		t.Fatal("expected invalid request ID to be replaced")
	}
	if len(got) != 24 {
		t.Fatalf("generated request ID length = %d, want 24", len(got))
	}
}

func TestRequestIDReplacesTooLongHeader(t *testing.T) {
	handler := RequestID(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("X-Request-Id", strings.Repeat("a", 129))
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	got := rec.Header().Get("X-Request-Id")
	if got == "" {
		t.Fatal("expected generated X-Request-Id")
	}
	if len(got) != 24 {
		t.Fatalf("generated request ID length = %d, want 24", len(got))
	}
	if got == strings.Repeat("a", 129) {
		t.Fatal("expected too long request ID to be replaced")
	}
}

func TestRateLimiterBlocksAfterLimitAndResetsAfterWindow(t *testing.T) {
	limiter := NewRateLimiter(2, 25*time.Millisecond, nil)
	handler := limiter.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	makeReq := func() *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodGet, "/limited", nil)
		req.RemoteAddr = "198.51.100.9:1234"
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		return rec
	}

	if got := makeReq().Code; got != http.StatusNoContent {
		t.Fatalf("first request status = %d, want %d", got, http.StatusNoContent)
	}
	if got := makeReq().Code; got != http.StatusNoContent {
		t.Fatalf("second request status = %d, want %d", got, http.StatusNoContent)
	}
	if got := makeReq().Code; got != http.StatusTooManyRequests {
		t.Fatalf("third request status = %d, want %d", got, http.StatusTooManyRequests)
	}
	if got := makeReq().Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("Cache-Control on 429 = %q, want no-store", got)
	}

	time.Sleep(35 * time.Millisecond)

	if got := makeReq().Code; got != http.StatusNoContent {
		t.Fatalf("request after window status = %d, want %d", got, http.StatusNoContent)
	}
}

func TestRateLimiterConcurrentRequestsRespectLimit(t *testing.T) {
	limit := 10
	limiter := NewRateLimiter(limit, time.Second, nil)
	handler := limiter.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	var allowed int32
	var denied int32
	var wg sync.WaitGroup
	total := 30

	for i := 0; i < total; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			req := httptest.NewRequest(http.MethodGet, "/limited", nil)
			req.RemoteAddr = "198.51.100.77:4321"
			rec := httptest.NewRecorder()
			handler.ServeHTTP(rec, req)
			if rec.Code == http.StatusNoContent {
				atomic.AddInt32(&allowed, 1)
				return
			}
			if rec.Code == http.StatusTooManyRequests {
				atomic.AddInt32(&denied, 1)
				return
			}
			t.Errorf("unexpected status: %d", rec.Code)
		}()
	}
	wg.Wait()

	if got := int(allowed); got != limit {
		t.Fatalf("allowed = %d, want %d", got, limit)
	}
	if got := int(denied); got != total-limit {
		t.Fatalf("denied = %d, want %d", got, total-limit)
	}
}

func TestStructuredLoggerLogsRequestFields(t *testing.T) {
	var logBuf bytes.Buffer
	original := slog.Default()
	logger := slog.New(slog.NewJSONHandler(&logBuf, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)
	defer slog.SetDefault(original)

	handler := StructuredLogger([]*net.IPNet{mustParseNet(t, "10.0.0.0/8")})(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTeapot)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	req.RemoteAddr = "10.1.1.10:3456"
	req.Header.Set("X-Real-IP", "203.0.113.42")
	rec := httptest.NewRecorder()
	rec.Header().Set("X-Request-Id", "req-logger-test")
	handler.ServeHTTP(rec, req)

	line := logBuf.String()
	for _, want := range []string{
		`"msg":"http_request"`,
		`"request_id":"req-logger-test"`,
		`"method":"GET"`,
		`"path":"/api/v1/health"`,
		`"status":418`,
		`"client_ip":"203.0.113.42"`,
		`"duration_ms":`,
	} {
		if !strings.Contains(line, want) {
			t.Fatalf("structured log = %q, want to contain %q", line, want)
		}
	}
}
