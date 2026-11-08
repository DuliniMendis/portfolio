import { ImageResponse } from "next/og";
import { QUALITIES } from "@/components/hero/qualities";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55;
}

// One sphere in the middle, six around it, as in the hero when the qualities combine.
const D = 150;
const GAP = 158;
const CX = 900;
const CY = 315;

export default function Image() {
  const centre = QUALITIES[QUALITIES.length - 1];
  const ring = QUALITIES.slice(0, -1);
  const sphere = (name: string, color: string, x: number, y: number) => (
    <div
      key={name}
      style={{
        position: "absolute",
        left: x - D / 2,
        top: y - D / 2,
        width: D,
        height: D,
        borderRadius: D,
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        fontWeight: 600,
        color: isLight(color) ? "#0e1717" : "#fff4e6",
      }}
    >
      {name}
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#f7f9fa",
          color: "#0e1717",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 80px", width: 680 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#5a6a72" }}>
            Builder and leader
          </div>
          <div style={{ fontSize: 92, fontWeight: 700, marginTop: 16, lineHeight: 1 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 38, marginTop: 28, color: "#3b4a51", lineHeight: 1.25 }}>{SITE_TAGLINE}</div>
        </div>
        {ring.map((q, i) => {
          const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
          return sphere(q.name, q.color, CX + Math.cos(a) * GAP, CY + Math.sin(a) * GAP);
        })}
        {sphere(centre.name, centre.color, CX, CY)}
      </div>
    ),
    size,
  );
}
