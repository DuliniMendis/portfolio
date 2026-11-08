/** CSS stand-in: loading skeleton, no-WebGL fallback, and reduced-data fallback. */
export function StaticOrb() {
  return (
    <div
      aria-hidden
      className="h-56 w-56 rounded-full bg-[radial-gradient(circle_at_30%_28%,#ffd0a3_0%,#ff9a3d_30%,#5cc6f4_68%,#1a96d2_100%)] shadow-[0_40px_120px_-20px_rgba(92,198,244,0.5)] md:h-80 md:w-80"
    />
  );
}
