/** CSS stand-in: loading skeleton, no-WebGL fallback, and reduced-data fallback. */
export function StaticOrb() {
  return (
    <div
      aria-hidden
      className="h-56 w-56 rounded-full bg-[radial-gradient(circle_at_30%_28%,#ffc79a_0%,#ffa969_30%,#4db3de_68%,#0c6f98_100%)] shadow-[0_40px_120px_-20px_rgba(12,111,152,0.4)] md:h-80 md:w-80"
    />
  );
}
