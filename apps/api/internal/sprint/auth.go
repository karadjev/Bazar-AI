package sprint

import (
	"net/http"

	"bazar-ai/apps/api/internal/auth"
)

func resolveOwnerID(r *http.Request) string {
	return auth.UserFromRequest(r).ID
}
