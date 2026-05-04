import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "BuildYourStore.ai — storefront and leads for local business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG art: brand gradient (ink → sea → berry) + RU/EN line — matches app tokens */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(125deg, #0A0D12 0%, #1D6F82 38%, #8B3258 88%)",
          padding: 72,
          color: "#ffffff",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.22)",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.02em"
          }}
        >
          <span style={{ opacity: 0.95 }}>BuildYourStore.ai</span>
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, maxWidth: 980 }}>
          Storefront in minutes. Leads in chat.
        </div>
        <div style={{ marginTop: 22, fontSize: 28, fontWeight: 500, opacity: 0.9, maxWidth: 920, lineHeight: 1.4 }}>
          No code. Built for local business and small eCommerce teams.
        </div>
        <div style={{ marginTop: 36, fontSize: 22, fontWeight: 500, opacity: 0.72, letterSpacing: "-0.01em" }}>
          Storefront in minutes · Orders in chat · No code
        </div>
      </div>
    ),
    { ...size }
  );
}
