package storage

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"bazar-ai/apps/api/internal/platform"
	"bazar-ai/apps/api/pkg/httpx"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

const maxUploadSize = 5 << 20

type Handler struct {
	repo    *platform.Repository
	dir     string
	baseURL string
	minio   *minio.Client
	bucket  string
}

func NewMinIOHandler(repo *platform.Repository, dir, baseURL, endpoint, accessKey, secretKey, bucket string, useSSL bool) (Handler, error) {
	handler := Handler{repo: repo, dir: dir, baseURL: strings.TrimRight(baseURL, "/"), bucket: bucket}
	if endpoint == "" {
		return handler, nil
	}
	client, err := minio.New(endpoint, &minio.Options{Creds: credentials.NewStaticV4(accessKey, secretKey, ""), Secure: useSSL})
	if err != nil {
		return Handler{}, err
	}
	handler.minio = client
	return handler, nil
}

func (h Handler) UploadProductImage(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		httpx.Error(w, http.StatusBadRequest, "image is too large")
		return
	}
	file, header, err := r.FormFile("image")
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "image file is required")
		return
	}
	defer file.Close()
	head := make([]byte, 512)
	n, _ := io.ReadFull(file, head)
	mime := http.DetectContentType(head[:n])
	ext, err := imageExt(mime)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "unsupported image MIME type")
		return
	}
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		httpx.Error(w, http.StatusBadRequest, "could not read image")
		return
	}
	content, err := io.ReadAll(file)
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "could not read image")
		return
	}
	if int64(len(content)) > maxUploadSize {
		httpx.Error(w, http.StatusBadRequest, "image is too large")
		return
	}
	name := randomName() + ext
	url, err := h.save(r.Context(), name, content, mime)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "could not save image")
		return
	}
	productID := r.PathValue("id")
	if productID != "" {
		_ = h.repo.AddProductImage(r.Context(), productID, url)
	}
	httpx.JSON(w, http.StatusCreated, map[string]any{
		"url":         url,
		"preview_url": url,
		"mime":        mime,
		"filename":    header.Filename,
		"max_size":    maxUploadSize,
	})
}

func (h Handler) save(ctx context.Context, name string, content []byte, mime string) (string, error) {
	if h.minio != nil {
		exists, err := h.minio.BucketExists(ctx, h.bucket)
		if err != nil {
			return "", err
		}
		if !exists {
			if err := h.minio.MakeBucket(ctx, h.bucket, minio.MakeBucketOptions{}); err != nil {
				return "", err
			}
		}
		_, err = h.minio.PutObject(ctx, h.bucket, name, bytes.NewReader(content), int64(len(content)), minio.PutObjectOptions{ContentType: mime})
		if err != nil {
			return "", err
		}
		return h.baseURL + "/" + name, nil
	}
	if err := os.MkdirAll(h.dir, 0o755); err != nil {
		return "", err
	}
	path := filepath.Join(h.dir, name)
	if err := os.WriteFile(path, content, 0o644); err != nil {
		return "", err
	}
	return h.baseURL + "/" + name, nil
}

func imageExt(mime string) (string, error) {
	switch mime {
	case "image/jpeg":
		return ".jpg", nil
	case "image/png":
		return ".png", nil
	case "image/webp":
		return ".webp", nil
	default:
		return "", errors.New("unsupported MIME")
	}
}

func randomName() string {
	bytes := make([]byte, 16)
	_, _ = rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
