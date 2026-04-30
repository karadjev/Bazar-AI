package validator

import (
	"errors"
	"regexp"
	"strings"
)

var uuidPattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

func Required(value, field string) error {
	if strings.TrimSpace(value) == "" {
		return errors.New(field + " is required")
	}
	return nil
}

func Length(value, field string, min, max int) error {
	size := len([]rune(strings.TrimSpace(value)))
	if size < min || size > max {
		return errors.New(field + " length is invalid")
	}
	return nil
}

func UUID(value, field string) error {
	if value == "" || !uuidPattern.MatchString(value) {
		return errors.New(field + " must be a valid UUID")
	}
	return nil
}

func Enum(value, field string, allowed ...string) error {
	for _, option := range allowed {
		if value == option {
			return nil
		}
	}
	return errors.New(field + " is invalid")
}

func Phone(value string) string {
	value = strings.TrimSpace(value)
	replacer := strings.NewReplacer(" ", "", "-", "", "(", "", ")", "")
	return replacer.Replace(value)
}

func Text(value string, max int) string {
	value = strings.TrimSpace(value)
	value = strings.ReplaceAll(value, "\x00", "")
	runes := []rune(value)
	if len(runes) > max {
		return string(runes[:max])
	}
	return value
}
