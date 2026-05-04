package httpx

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// RespondDecodeError отвечает на ошибку [Decode]: 413 для превышения лимита тела, иначе 400 с validation_error.
func RespondDecodeError(w http.ResponseWriter, r *http.Request, err error, badRequestMessage string) {
	var maxErr *http.MaxBytesError
	if errors.As(err, &maxErr) {
		ErrorWithRequest(w, r, http.StatusRequestEntityTooLarge, "payload_too_large", "request body too large")
		return
	}
	ErrorWithRequest(w, r, http.StatusBadRequest, "validation_error", badRequestMessage)
}

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

// RespondInfraError нормализует инфраструктурные ошибки (DB/driver) в единый HTTP-контракт.
func RespondInfraError(w http.ResponseWriter, r *http.Request, err error, fallbackMessage string) {
	status, code := infraErrorMapping(err)
	ErrorWithRequest(w, r, status, code, fallbackMessage)
}

func ErrorCode(w http.ResponseWriter, status int, code, message, requestID string) {
	JSON(w, status, ErrorResponse{Error: ErrorBody{Code: code, Message: message, RequestID: requestID}})
}

func Decode(r *http.Request, target any) error {
	if r.Body == nil {
		return errors.New("request body is required")
	}
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		return err
	}
	var extra struct{}
	if err := decoder.Decode(&extra); err != io.EOF {
		return errors.New("request body must contain a single JSON value")
	}
	return nil
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
	case http.StatusConflict:
		return "conflict"
	case http.StatusPaymentRequired:
		return "quota_exceeded"
	case http.StatusTooManyRequests:
		return "rate_limited"
	case http.StatusRequestEntityTooLarge:
		return "payload_too_large"
	case http.StatusBadGateway:
		return "upstream_error"
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

func infraErrorMapping(err error) (int, string) {
	if errors.Is(err, pgx.ErrNoRows) {
		return http.StatusNotFound, "not_found"
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505":
			return http.StatusConflict, "conflict"
		case "23503", "23514":
			return http.StatusBadRequest, "validation_error"
		}
		if len(pgErr.Code) == 5 && pgErr.Code[:2] == "22" {
			return http.StatusBadRequest, "validation_error"
		}
	}
	return http.StatusInternalServerError, "internal_error"
}
