package sprint

import (
	"net/http"
	"strings"

	"bazar-ai/apps/api/internal/auth"
)

const guestOwnerID = "00000000-0000-0000-0000-000000000001"

func resolveOwnerID(r *http.Request) string {
	userID := auth.UserFromRequest(r).ID
	if userID != "" {
		return userID
	}
	if isGuestMode(r) {
		return guestOwnerID
	}
	return ""
}

func isGuestMode(r *http.Request) bool {
	if strings.TrimSpace(r.URL.Query().Get("guest")) == "1" {
		return true
	}
	return strings.TrimSpace(r.Header.Get("X-Guest-Mode")) == "1"
}
