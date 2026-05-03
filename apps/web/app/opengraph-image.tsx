import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "BuildYourStore.ai — витрина и заявки для локального бизнеса";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #0d1117 0%, #247c8d 42%, #92385f 100%)",
          padding: 72,
          color: "#ffffff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif"
        }}
      >
        <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08 }}>BuildYourStore.ai</div>
        <div style={{ marginTop: 28, fontSize: 30, fontWeight: 500, opacity: 0.92, maxWidth: 880, lineHeight: 1.35 }}>
          Интернет-витрина за минуты. Заявки в мессенджеры. Без кода.
        </div>
      </div>
    ),
    { ...size }
  );
}
