import { svgFrame } from "./svg";
import { CONTENT_H, GROUND_DEPTH_2, GROUND_DEPTH_3, SCALE3_MIN_H, SCALE3_MIN_W } from "./world";

/**
 * The game's first frame (her waving in front of the Canva tower) as server-rendered SVG, so the panel is painted
 * before JavaScript runs and without it. Same pixel scale and placement as the canvas, so nothing jumps when the
 * engine takes over: the camera focus sits at the panel's horizontal centre and the ground line sits the same
 * depth above its bottom; a container query switches 2 to 3 CSS px per game pixel at the same width as the engine.
 */
export function StaticFrame() {
  const { paths, images } = svgFrame();
  // panelLayout() in CSS: 1cqh is 1% of the panel height, so H / scale / 2 is 25cqh at 2× and 16.667cqh at 3×.
  // The first transform is a fallback for browsers without CSS round().
  const lift = (scale: number, base: number, cqh: string) =>
    `transform:scale(${scale}) translateY(-${base}px);` +
    `transform:scale(${scale}) translateY(calc(-${base}px - max(0px, round(${cqh} - ${CONTENT_H / 2}px, 1px))))`;
  const css =
    `.cg-world{${lift(2, GROUND_DEPTH_2, "25cqh")}}` +
    `@container (min-width:${SCALE3_MIN_W}px) and (min-height:${SCALE3_MIN_H}px){.cg-world{${lift(3, GROUND_DEPTH_3, "16.6667cqh")}}}`;
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full" data-static-frame>
      <style>{css}</style>
      <svg x="50%" y="100%" overflow="visible">
        <g className="cg-world" shapeRendering="crispEdges">
          {paths.map(([c, d], i) => (
            <path key={i} fill={c} d={d} />
          ))}
          {images.map((img) => (
            <image key={img.href} href={img.href} x={img.x} y={img.y} width={img.w} height={img.h} />
          ))}
        </g>
      </svg>
    </svg>
  );
}
