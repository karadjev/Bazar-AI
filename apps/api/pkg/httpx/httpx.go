package httpx

import (
	"encoding/json"
	"net/http"
	"strconv"
)

type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

type ErrorBody struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	RequestID string `json:"request_id,omitempty"`
}

type Pagination struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Total int `json:"total,omitempty"`
}

type ListResponse struct {
	Data any        `json:"data"`
	Meta Pagination `json:"meta"`
}

func JSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func Error(w http.ResponseWriter, status int, message string) {
	ErrorCode(w, status, codeForStatus(status), message, "")
}

func ErrorWithRequest(w http.ResponseWriter, r *http.Request, status int, code, message string) {
	ErrorCode(w, status, code, message, r.Header.Get("X-Request-Id"))
}

func ErrorCode(w http.ResponseWriter, status int, code, message, requestID string) {
	JSON(w, status, ErrorResponse{Error: ErrorBody{Code: code, Message: message, RequestID: requestID}})
}

func Decode(r *http.Request, target any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(target)
}

func Page(r *http.Request) (int, int) {
	page := queryInt(r, "page", 1)
	limit := queryInt(r, "limit", 20)
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	return page, limit
}

func Offset(page, limit int) int {
	return (page - 1) * limit
}

func codeForStatus(status int) string {
	switch status {
	case http.StatusBadRequest:
		return "validation_error"
	case http.StatusUnauthorized:
		return "unauthorized"
	case http.StatusForbidden:
		return "forbidden"
	case http.StatusNotFound:
		return "not_found"
	case http.StatusTooManyRequests:
		return "rate_limited"
	default:
		if status >= 500 {
			return "internal_error"
		}
		return "request_error"
	}
}

func queryInt(r *http.Request, key string, fallback int) int {
	value := r.URL.Query().Get(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}
