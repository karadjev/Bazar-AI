package storage

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type errorEnvelope struct {
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

func newMultipartBody(t *testing.T, field string, filename string, content []byte) (*bytes.Buffer, string) {
	t.Helper()
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile(field, filename)
	if err != nil {
		t.Fatalf("CreateFormFile: %v", err)
	}
	if _, err := part.Write(content); err != nil {
		t.Fatalf("part.Write: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("writer.Close: %v", err)
	}
	return body, writer.FormDataContentType()
}

func TestUploadProductImageTooLargeReturns413(t *testing.T) {
	handler := Handler{dir: t.TempDir(), baseURL: "http://localhost"}
	content := bytes.Repeat([]byte("a"), int(maxUploadSize)+1)
	body, contentType := newMultipartBody(t, "image", "big.jpg", content)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/products/p1/images", body)
	req.Header.Set("Content-Type", contentType)
	rec := httptest.NewRecorder()
	handler.UploadProductImage(rec, req)

	if rec.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusRequestEntityTooLarge)
	}
	var payload errorEnvelope
	if err := json.NewDecoder(rec.Body).Decode(&payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Error.Code != "payload_too_large" {
		t.Fatalf("error.code = %q, want payload_too_large", payload.Error.Code)
	}
}

func TestUploadProductImageMissingFileReturnsValidationError(t *testing.T) {
	handler := Handler{dir: t.TempDir(), baseURL: "http://localhost"}
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	if err := writer.Close(); err != nil {
		t.Fatalf("writer.Close: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/products/p1/images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()
	handler.UploadProductImage(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
	var payload errorEnvelope
	if err := json.NewDecoder(rec.Body).Decode(&payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Error.Code != "validation_error" {
		t.Fatalf("error.code = %q, want validation_error", payload.Error.Code)
	}
	if !strings.Contains(payload.Error.Message, "image file is required") {
		t.Fatalf("error.message = %q, want missing image hint", payload.Error.Message)
	}
}
