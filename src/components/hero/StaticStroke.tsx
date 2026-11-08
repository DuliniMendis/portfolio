import { alphaAt, LABEL_AT, layoutStroke, pointAt, prepareStroke } from "./brush";
import { readableTextColor } from "./contrast";
import { SKILLS } from "./skills";

// Server-rendered stand-in for the canvas: the first skill's stroke as an SVG, drawn from the same
// brush maths at a nominal size. It is what people see before JavaScript runs (and if it never
// does), and the animation fades it out as the second stroke starts drawing.

const VW = 560;
const VH = 600;
/** Keep every n-th bristle and every n-th sample, with lines widened to make up the coverage. */
const BRISTLE_STEP = 3;
const SAMPLE_STEP = 5;
/** Dry-trail dashes shorter than this many kept samples are dropped (they read as square stubs). */
const MIN_RUN = 3;

const skill = SKILLS[0];
const stroke = prepareStroke(0, layoutStroke(0, VW, VH, skill.name.length), skill.color);
const { curve } = stroke.layout;
const n = curve.xs.length;
const label = pointAt(curve, LABEL_AT);
const angle = Math.max(-8, Math.min(8, (label.angle * 180) / Math.PI));

const r1 = (v: number) => Math.round(v * 10) / 10;

/** One SVG path per kept bristle, broken where the brush ran dry. */
const paths = stroke.bristles
  .filter((_, i) => i % BRISTLE_STEP === 0)
  .map((b) => {
    const k0 = Math.ceil((b.startT * (n - 1)) / SAMPLE_STEP) * SAMPLE_STEP;
    const k1 = Math.floor(b.endT * (n - 1));
    const runs: string[][] = [];
    let run: string[] = [];
    for (let k = k0; k <= k1; k += SAMPLE_STEP) {
      if (b.on[k]) run.push(`${r1(b.xs[k])} ${r1(b.ys[k])}`);
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

const first = { x: curve.xs[0], y: curve.ys[0] };
const last = { x: curve.xs[n - 1], y: curve.ys[n - 1] };
const loadStops = [0, 0.6, 0.8, 1].map((t) => ({ t, a: r1(alphaAt(t)) }));

export function StaticStroke() {
  return (
    <div aria-hidden className="absolute inset-0">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        focusable="false"
      >
        <defs>
          <linearGradient
            id="static-stroke-load"
            gradientUnits="userSpaceOnUse"
            x1={r1(first.x)}
            y1={r1(first.y)}
            x2={r1(last.x)}
            y2={r1(last.y)}
          >
            {loadStops.map(({ t, a }) => (
              <stop key={t} offset={t} stopColor="#fff" stopOpacity={a} />
            ))}
          </linearGradient>
          <mask id="static-stroke-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
            <rect width={VW} height={VH} fill="url(#static-stroke-load)" />
          </mask>
        </defs>
        <g mask="url(#static-stroke-mask)" fill="none" strokeLinecap="butt" strokeLinejoin="round">
          {paths.map((p, i) => (
            <path key={i} d={p.d} stroke={p.color} strokeWidth={p.width} strokeOpacity={p.opacity} />
          ))}
        </g>
      </svg>
      <span
        className="absolute w-max max-w-[60cqw] -translate-x-1/2 -translate-y-1/2 text-center font-display text-[clamp(16px,6cqw,34px)] font-semibold leading-[1.05] tracking-[-0.01em] [text-wrap:balance]"
        style={{
          left: `${r1((label.x / VW) * 100)}%`,
          top: `${r1((label.y / VH) * 100)}%`,
          rotate: `${r1(angle)}deg`,
          color: readableTextColor(skill.color),
        }}
      >
        {skill.name}
      </span>
    </div>
  );
}
