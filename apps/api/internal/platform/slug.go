package platform

import "strings"

func Slugify(value string) string {
	slug := strings.ToLower(strings.TrimSpace(value))
	replacements := map[string]string{" ": "-", "_": "-", ".": "", ",": "", "'": "", "\"": ""}
	for old, newValue := range replacements {
		slug = strings.ReplaceAll(slug, old, newValue)
	}
	if slug == "" {
		return "store"
	}
	return slug
}
