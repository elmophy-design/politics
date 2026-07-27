import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#ffffff",
          backgroundImage:
            "radial-gradient(#0a3620 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "-12px -12px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#158a42",
            fontFamily: "Georgia, serif",
          }}
        >
          Official Platform
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 64,
            fontWeight: 700,
            color: "#0a3620",
            fontFamily: "Georgia, serif",
            maxWidth: 900,
          }}
        >
          Hon. Barr. Lucky Eseigbe
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 28,
            color: "#55605a",
            maxWidth: 800,
          }}
        >
          Serving the constituency with integrity, transparency, and action.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            width: 80,
            height: 4,
            background: "#c9a227",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
