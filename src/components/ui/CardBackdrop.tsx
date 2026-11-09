import Image, { type StaticImageData } from "next/image";

type CardBackdropProps = {
  /** A screenshot to show faded behind the card. Takes priority over the colours. */
  image?: StaticImageData;
  /** Brand colours for a soft wash when there is no screenshot: one colour, or two for a gradient. */
  colors: readonly string[];
};

/**
 * Faded backdrop for a link card. The card must be `relative isolate overflow-hidden` and a `group`.
 * It is strongest at the top and fades out by three quarters of the way down, so body text and tags sit on
 * near-plain white and keep their contrast. Decorative only.
 */
export function CardBackdrop({ image, colors }: CardBackdropProps) {
  const [from, to = from] = colors;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-left-top opacity-20 transition-opacity duration-500 group-hover:opacity-35"
        />
      ) : (
        <div
          className="h-full w-full opacity-[0.22] transition-opacity duration-500 group-hover:opacity-[0.32]"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        />
      )}
    </div>
  );
}
