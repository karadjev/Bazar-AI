package config

import (
	"fmt"
	"net"
	"strings"
)

// defaultTrustedProxyCIDRs — RFC1918 и loopback: типичные сети Docker/K8s и локальная разработка.
// Для продакшена за своим ingress задайте API_TRUSTED_PROXY_CIDRS явно (подсеть балансировщика).
const defaultTrustedProxyCIDRs = "127.0.0.0/8,::1/128,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"

func parseTrustedProxyCIDRs(raw string) ([]*net.IPNet, error) {
	s := strings.TrimSpace(raw)
	if s == "" {
		return parseCIDRList(defaultTrustedProxyCIDRs)
	}
	if strings.EqualFold(s, "direct") {
		return nil, nil
	}
	return parseCIDRList(s)
}

func parseCIDRList(csv string) ([]*net.IPNet, error) {
	var out []*net.IPNet
	for _, part := range strings.Split(csv, ",") {
		cidr := strings.TrimSpace(part)
		if cidr == "" {
			continue
		}
		_, ipNet, err := net.ParseCIDR(cidr)
		if err != nil {
			return nil, fmt.Errorf("invalid CIDR %q in API_TRUSTED_PROXY_CIDRS: %w", cidr, err)
		}
		out = append(out, ipNet)
	}
	if len(out) == 0 {
		return nil, fmt.Errorf("API_TRUSTED_PROXY_CIDRS: no valid CIDRs after parsing")
	}
	return out, nil
}
