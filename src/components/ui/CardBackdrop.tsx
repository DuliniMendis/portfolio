import Image, { type StaticImageData } from "next/image";

export type Brand = {
  /** The card's single background colour. */
  color: string;
  /** Text colour that passes 4.5:1 on `color`: white ("light") or ink ("dark"). */
  text: "light" | "dark";
};

/** Text classes for a card on a brand colour. */
export const BRAND_TEXT = {
  light: { body: "text-white", icon: "text-white/80 group-hover:text-white", tag: "light" },
  dark: { body: "text-ink", icon: "text-ink/70 group-hover:text-ink", tag: "dark" },
} as const;

/**
 * Solid brand-colour background for a link card, with an optional screenshot blended into the colour.
 * The card must be `relative isolate overflow-hidden` and a `group`.
 * The screenshot is greyscale and multiplied into the colour (screen-blended on light colours with dark text), so
 * the card stays one colour and the image only ever pushes the background away from the text colour. It fades out
 * by three quarters of the way down, so the body text and tags sit on the plain colour. Decorative only.
 */
export function CardBackdrop({ brand, image }: { brand: Brand; image?: StaticImageData }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundColor: brand.color }}>
      {image ? (
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]">
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className={`object-cover object-left-top opacity-45 grayscale transition-opacity duration-500 group-hover:opacity-65 ${
              brand.text === "light" ? "mix-blend-multiply" : "mix-blend-screen"
            }`}
          />
        </div>
      ) : null}
    </div>
  );
}
