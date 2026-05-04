package middleware

import (
	"bazar-ai/apps/api/pkg/httpx"

	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"runtime/debug"
	"sort"
	"strings"
	"sync"
	"time"
)

type responseWriter struct {
	http.ResponseWriter
	status int
}

func (w *responseWriter) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

func (w *responseWriter) Write(body []byte) (int, error) {
	if w.status == 0 {
		w.status = http.StatusOK
	}
	return w.ResponseWriter.Write(body)
}

func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := strings.TrimSpace(r.Header.Get("X-Request-Id"))
		if requestID == "" || len(requestID) > 128 || strings.ContainsAny(requestID, "\r\n") {
			requestID = randomID()
		}
		w.Header().Set("X-Request-Id", requestID)
		next.ServeHTTP(w, r)
	})
}

// StructuredLogger пишет JSON-лог по завершении запроса (включая client_ip с учётом доверенных прокси).
func StructuredLogger(trusted []*net.IPNet) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(rw, r)
			slog.Info("http_request",
				"request_id", w.Header().Get("X-Request-Id"),
				"method", r.Method,
				"path", r.URL.Path,
				"client_ip", ClientIP(r, trusted),
				"status", rw.status,
				"duration_ms", time.Since(start).Milliseconds(),
			)
		})
	}
}

// RecoverPanic перехватывает panic в обработчиках и отвечает 500 без падения процесса.
func RecoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rv := recover(); rv != nil {
				stack := debug.Stack()
				if len(stack) > 8192 {
					stack = stack[:8192]
				}
				slog.Error("panic_recovered",
					"request_id", r.Header.Get("X-Request-Id"),
					"method", r.Method,
					"path", r.URL.Path,
					"panic", rv,
					"stack", string(stack),
				)
				// Avoid caching 5xx JSON error bodies by intermediaries.
				w.Header().Set("Cache-Control", "no-store")
				httpx.ErrorWithRequest(w, r, http.StatusInternalServerError, "internal_error", "unexpected server error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// SecurityHeaders — базовые заголовки для API и статики.
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		next.ServeHTTP(w, r)
	})
}

// MaxRequestBody ограничивает размер тела для методов с телом; multipart пропускается (загрузки задают свой лимит).
func MaxRequestBody(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Body == nil {
				next.ServeHTTP(w, r)
				return
			}
			switch r.Method {
			case http.MethodPost, http.MethodPut, http.MethodPatch:
			default:
				next.ServeHTTP(w, r)
				return
			}
			ct := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
			if strings.HasPrefix(ct, "multipart/") {
				next.ServeHTTP(w, r)
				return
			}
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			next.ServeHTTP(w, r)
		})
	}
}

type StatusMetrics struct {
	mu     sync.Mutex
	counts map[metricKey]int64
}

type metricKey struct {
	Method      string
	Endpoint    string
	Status      int
	StatusClass string
}

func NewStatusMetrics() *StatusMetrics {
	return &StatusMetrics{counts: map[metricKey]int64{}}
}

func (m *StatusMetrics) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rw, r)
		m.Record(r.Method, endpointPattern(r), rw.status)
	})
}

func (m *StatusMetrics) Handler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		snapshot := m.snapshot()
		w.Header().Set("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
		_, _ = fmt.Fprintln(w, "# HELP bazar_api_http_responses_total Total API responses by endpoint and status.")
		_, _ = fmt.Fprintln(w, "# TYPE bazar_api_http_responses_total counter")
		for _, item := range snapshot {
			_, _ = fmt.Fprintf(
				w,
				"bazar_api_http_responses_total{method=%q,endpoint=%q,status=%q,status_class=%q} %d\n",
				item.Method,
				item.Endpoint,
				fmt.Sprintf("%d", item.Status),
				item.StatusClass,
				item.Count,
			)
		}
	})
}

func (m *StatusMetrics) Record(method, endpoint string, status int) {
	if status == 0 {
		status = http.StatusOK
	}
	key := metricKey{Method: method, Endpoint: endpoint, Status: status, StatusClass: statusClass(status)}
	m.mu.Lock()
	m.counts[key]++
	m.mu.Unlock()
}

type metricSnapshot struct {
	metricKey
	Count int64
}

func (m *StatusMetrics) snapshot() []metricSnapshot {
	m.mu.Lock()
	defer m.mu.Unlock()

	out := make([]metricSnapshot, 0, len(m.counts))
	for key, count := range m.counts {
		out = append(out, metricSnapshot{metricKey: key, Count: count})
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Endpoint != out[j].Endpoint {
			return out[i].Endpoint < out[j].Endpoint
		}
		if out[i].Method != out[j].Method {
			return out[i].Method < out[j].Method
		}
		return out[i].Status < out[j].Status
	})
	return out
}

type RateLimiter struct {
	mu       sync.Mutex
	requests map[string][]time.Time
	limit    int
	window   time.Duration
	trusted  []*net.IPNet
}

// NewRateLimiter лимитирует по client IP; trusted задаёт сети прокси (см. config.TrustedProxyNets).
func NewRateLimiter(limit int, window time.Duration, trusted []*net.IPNet) *RateLimiter {
	return &RateLimiter{requests: map[string][]time.Time{}, limit: limit, window: window, trusted: trusted}
}

func (l *RateLimiter) compactLocked(now time.Time) {
	for ip, times := range l.requests {
		recent := make([]time.Time, 0, len(times))
		for _, at := range times {
			if now.Sub(at) < l.window {
				recent = append(recent, at)
			}
		}
		if len(recent) == 0 {
			delete(l.requests, ip)
		} else {
			l.requests[ip] = recent
		}
	}
}

func (l *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := ClientIP(r, l.trusted)
		now := time.Now()
		l.mu.Lock()
		recent := l.requests[ip][:0]
		for _, at := range l.requests[ip] {
			if now.Sub(at) < l.window {
				recent = append(recent, at)
			}
		}
		if len(recent) >= l.limit {
			l.mu.Unlock()
			// Rate-limit responses must not be cached.
			w.Header().Set("Cache-Control", "no-store")
			httpx.ErrorWithRequest(w, r, http.StatusTooManyRequests, "rate_limited", "rate limit exceeded")
			return
		}
		l.requests[ip] = append(recent, now)
		if len(l.requests) > 2048 {
			l.compactLocked(now)
		}
		l.mu.Unlock()
		next.ServeHTTP(w, r)
	})
}

// ClientIP возвращает IP клиента для лимитов и аудита.
// Если TCP-пир не в trusted, заголовки X-Real-IP / X-Forwarded-For игнорируются.
func ClientIP(r *http.Request, trusted []*net.IPNet) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host = r.RemoteAddr
	}
	direct := net.ParseIP(host)
	if direct == nil {
		return host
	}
	if !ipInTrustedNets(direct, trusted) {
		return direct.String()
	}
	if realIP := strings.TrimSpace(r.Header.Get("X-Real-IP")); realIP != "" {
		if ip := net.ParseIP(realIP); ip != nil {
			return ip.String()
		}
	}
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		for _, part := range strings.Split(forwarded, ",") {
			ip := net.ParseIP(strings.TrimSpace(part))
			if ip != nil {
				return ip.String()
			}
		}
	}
	return direct.String()
}

func ipInTrustedNets(ip net.IP, nets []*net.IPNet) bool {
	if len(nets) == 0 {
		return false
	}
	for _, n := range nets {
		if n.Contains(ip) {
			return true
		}
	}
	return false
}

func randomID() string {
	bytes := make([]byte, 12)
	_, _ = rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func endpointPattern(r *http.Request) string {
	if pattern := r.Pattern; pattern != "" {
		return pattern
	}
	if r.URL != nil && r.URL.Path != "" {
		return r.URL.Path
	}
	return "unknown"
}

func statusClass(status int) string {
	if status < 100 {
		return "unknown"
	}
	return fmt.Sprintf("%dxx", status/100)
}


