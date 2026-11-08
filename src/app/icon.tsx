import { ImageResponse } from "next/og";
import { QUALITIES } from "@/components/hero/qualities";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon: the "Creativity" sphere on the ink background.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e1717",
          borderRadius: 14,
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 36, background: QUALITIES[0].color }} />
      </div>
    ),
    size,
  );
}
