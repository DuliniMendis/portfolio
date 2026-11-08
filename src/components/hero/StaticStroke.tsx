import {
  alphaAt,
  estimateWidth,
  LABEL_AT,
  LANE_ORDER,
  LANES,
  layoutLabel,
  layoutStroke,
  prepareStroke,
  shade,
  type Curve,
} from "./brush";
import { relativeLuminance } from "./contrast";
import { SKILLS } from "./skills";

// Server-rendered stand-in for the canvas: the first strokes in the sequence, already painted, as
// SVG drawn from the same brush maths at a nominal size. It is what people see before JavaScript
// runs (and if it never does); the animation fades each one out on its own schedule.

/** How many strokes the server paints; the animation picks up from the next one. */
export const STATIC_COUNT = 2;

const VW = 560;
const VH = 600;
/** Keep every n-th bristle and every n-th sample, with lines widened to make up the coverage. */
const BRISTLE_STEP = 3;
const SAMPLE_STEP = 5;
/** Dry-trail dashes shorter than this many kept samples are dropped (they read as square stubs). */
const MIN_RUN = 3;

const r1 = (v: number) => Math.round(v * 10) / 10;

/** The curve shifted along its normal by `offset`, as an SVG path. */
function offsetPath(curve: Curve, offset: number) {
  const pts: string[] = [];
  for (let k = 0; k < curve.xs.length; k += 8) {
    const a = curve.angles[k];
    pts.push(`${r1(curve.xs[k] - Math.sin(a) * offset)} ${r1(curve.ys[k] + Math.cos(a) * offset)}`);
  }
  return `M${pts.join("L")}`;
}

const strokes = Array.from({ length: STATIC_COUNT }, (_, k) => {
  const skill = SKILLS[k];
  const layout = layoutStroke(k, LANE_ORDER[k % LANES.length], VW, VH, skill.name.length);
  const stroke = prepareStroke(k, layout, skill.color);
  const { curve } = layout;
  const n = curve.xs.length;

  // One SVG path per kept bristle, broken where the brush ran dry.
  const paths = stroke.bristles
    .filter((_, i) => i % BRISTLE_STEP === 0)
    .map((b) => {
      const k0 = Math.ceil((b.startT * (n - 1)) / SAMPLE_STEP) * SAMPLE_STEP;
      const k1 = Math.floor(b.endT * (n - 1));
      const runs: string[][] = [];
      let run: string[] = [];
      for (let i = k0; i <= k1; i += SAMPLE_STEP) {
        if (b.on[i]) run.push(`${r1(b.xs[i])} ${r1(b.ys[i])}`);
        else if (run.length) {
          runs.push(run);
          run = [];
        }
      }
      if (run.length) runs.push(run);
      const d = runs
        .filter((r) => r.length >= MIN_RUN)
        .map((r) => `M${r.join("L")}`)
        .join("");
      return { d, width: r1(b.lineWidth * 2.2), opacity: r1(b.alpha), color: b.color };
    })
    .filter((p) => p.d.includes("L"));

  const label = layoutLabel(skill.name, layout, estimateWidth);
  return {
    k,
    paths,
    first: { x: r1(curve.xs[0]), y: r1(curve.ys[0]) },
    last: { x: r1(curve.xs[n - 1]), y: r1(curve.ys[n - 1]) },
    lines: label.lines.map((line) => ({ text: line.text, d: offsetPath(curve, line.offset) })),
    size: label.size,
    shadow: shade(skill.color, -0.55, r1(0.3 + 0.5 * relativeLuminance(skill.color))),
  };
});

const loadStops = [0, 0.6, 0.8, 1].map((t) => ({ t, a: r1(alphaAt(t)) }));

export function StaticStroke() {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      focusable="false"
    >
      <defs>
        {strokes.map((s) => (
          <g key={s.k}>
            <linearGradient
              id={`static-load-${s.k}`}
              gradientUnits="userSpaceOnUse"
              x1={s.first.x}
              y1={s.first.y}
              x2={s.last.x}
              y2={s.last.y}
            >
              {loadStops.map(({ t, a }) => (
                <stop key={t} offset={t} stopColor="#fff" stopOpacity={a} />
              ))}
            </linearGradient>
            <mask id={`static-mask-${s.k}`} maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
              <rect width={VW} height={VH} fill={`url(#static-load-${s.k})`} />
            </mask>
            <filter id={`static-shadow-${s.k}`} x="-10%" y="-50%" width="120%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation={r1(s.size * 0.18)} floodColor={s.shadow} />
            </filter>
            {s.lines.map((line, i) => (
              <path key={i} id={`static-line-${s.k}-${i}`} d={line.d} fill="none" />
            ))}
          </g>
        ))}
      </defs>
      {strokes.map((s) => (
        <g key={s.k} data-static-stroke mask={`url(#static-mask-${s.k})`}>
          <g fill="none" strokeLinecap="butt" strokeLinejoin="round">
            {s.paths.map((p, i) => (
              <path key={i} d={p.d} stroke={p.color} strokeWidth={p.width} strokeOpacity={p.opacity} />
            ))}
          </g>
          <text
            fill="#fff"
            fillOpacity={0.95}
            fontSize={s.size}
            fontWeight={600}
            filter={`url(#static-shadow-${s.k})`}
            style={{ fontFamily: "var(--font-inter-tight), system-ui, sans-serif" }}
          >
            {s.lines.map((line, i) => (
              <textPath
                key={i}
                href={`#static-line-${s.k}-${i}`}
                startOffset={`${LABEL_AT * 100}%`}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {line.text}
              </textPath>
            ))}
          </text>
        </g>
      ))}
    </svg>
  );
}
