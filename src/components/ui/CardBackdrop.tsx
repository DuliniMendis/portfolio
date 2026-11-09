import Image, { type StaticImageData } from "next/image";

/** Arrow icon classes for a card on the CardBackdrop blue. */
export const CARD_ICON = "text-white/80 transition-colors group-hover:text-white";

/**
 * Background for a link card: a diagonal gradient of the theme's deep blues (or teal-ink for leadership work) (white text 5.2:1 at the lightest
 * corner, 6.0:1 on --blue-text, more towards the navy), with an optional screenshot
 * blended into it. The card must be `relative isolate overflow-hidden text-white` and a `group`.
 * The screenshot is greyscale and multiplied into the blue, so the card stays one colour and the image only ever
 * darkens it (more contrast for the white text, never less). It fades out diagonally, clear in the top-right corner and
 * gone by the bottom left, so the body text and tags sit on the plain colour. Decorative only.
 */
/** Card gradients. "lead" is a deep teal-ink, matching the dark Leadership section (white text 7.7:1 or better). */
const SHADES = {
  build: "bg-[linear-gradient(135deg,#0873ab_0%,var(--blue-text)_45%,#0b3550_100%)]",
  lead: "bg-[linear-gradient(135deg,#1f5a66_0%,#163c44_45%,var(--ink)_100%)]",
};

export function CardBackdrop({ image, shade = "build" }: { image?: StaticImageData; shade?: keyof typeof SHADES }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 ${SHADES[shade]}`}>
      {/* Soft light-blue glow in the top corner, as in the Leadership section. */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-light/20 blur-3xl" />
      {image ? (
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom_left,black,transparent_70%)]">
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-right-top opacity-45 mix-blend-multiply grayscale transition-opacity duration-500 group-hover:opacity-65"
          />
        </div>
      ) : null}
    </div>
  );
}
