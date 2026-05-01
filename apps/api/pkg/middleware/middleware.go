package middleware

import (
	"bazar-ai/apps/api/pkg/httpx"

	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"sort"
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
		requestID := r.Header.Get("X-Request-Id")
		if requestID == "" {
			requestID = randomID()
		}
		w.Header().Set("X-Request-Id", requestID)
		next.ServeHTTP(w, r)
	})
}

func StructuredLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rw, r)
		_ = json.NewEncoder(os.Stdout).Encode(map[string]any{
			"level":       "info",
			"ts":          time.Now().UTC().Format(time.RFC3339Nano),
			"request_id":  w.Header().Get("X-Request-Id"),
			"method":      r.Method,
			"path":        r.URL.Path,
			"status":      rw.status,
			"duration_ms": time.Since(start).Milliseconds(),
		})
	})
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
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{requests: map[string][]time.Time{}, limit: limit, window: window}
}

func (l *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)
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
			httpx.ErrorWithRequest(w, r, http.StatusTooManyRequests, "rate_limited", "rate limit exceeded")
			return
		}
		l.requests[ip] = append(recent, now)
		l.mu.Unlock()
		next.ServeHTTP(w, r)
	})
}

func clientIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		return forwarded
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
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
