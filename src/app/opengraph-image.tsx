import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LOGOS } from "@/components/hero/game/logos";
import { svgFrame } from "@/components/hero/game/svg";
import { BEAT, timeAt } from "@/components/hero/game/timeline";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The moment of the hero's career game shown in the share image: the Canva tower full of the team, with Dulini at the terminal. */
const OG_T = timeAt(BEAT.canva, 0.7);

/** Game pixels shown in the panel: camera focus at x = 0, ground line at y = 0. */
const VIEW = { x: -90, y: -170, w: 180, h: 183 };
const PANEL = { w: 472, h: 480 };
const SKY = "#d6eefc";

// The logos are files in public/; the image renderer cannot fetch relative URLs, so inline them.
const logoData = new Map(
  await Promise.all(
    Object.values(LOGOS).map(async ({ src }) => {
      const data = await readFile(join(process.cwd(), "public", src), "base64");
      return [src, `data:image/svg+xml;base64,${data}`] as const;
    }),
  ),
);

/** One frame of the game as a standalone SVG data URL, drawn by the same code as the hero's static frame. */
function gameFrame() {
  const { paths, images } = svgFrame(OG_T);
  const body =
    paths.map(([c, d]) => `<path fill="${c}" d="${d}"/>`).join("") +
    images
      .map((i) => `<image href="${logoData.get(i.href) ?? ""}" x="${i.x}" y="${i.y}" width="${i.w}" height="${i.h}"/>`)
      .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}" ` +
    `width="${PANEL.w}" height="${PANEL.h}" shape-rendering="crispEdges">` +
    `<rect x="${VIEW.x}" y="${VIEW.y}" width="${VIEW.w}" height="${VIEW.h}" fill="${SKY}"/>${body}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#f7f9fa",
          color: "#0e1717",
          padding: "0 64px 0 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 48 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#5a6a72" }}>
            Builder and leader
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, marginTop: 16, lineHeight: 1, whiteSpace: "nowrap" }}>{SITE_NAME}</div>
          <div style={{ fontSize: 38, marginTop: 28, color: "#3b4a51", lineHeight: 1.25 }}>{SITE_TAGLINE}</div>
        </div>
        <div
          style={{
            display: "flex",
            width: PANEL.w,
            height: PANEL.h,
            borderRadius: 24,
            overflow: "hidden",
            background: SKY,
            boxShadow: "0 24px 60px -20px rgba(26,150,210,0.45)",
          }}
        >
          <img src={gameFrame()} width={PANEL.w} height={PANEL.h} alt="" />
        </div>
      </div>
    ),
    size,
  );
}
