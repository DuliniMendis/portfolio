/** CSS stand-in: loading skeleton, no-WebGL fallback, and reduced-data fallback. */
export function StaticOrb() {
  return (
    <div
      aria-hidden
      className="h-56 w-56 rounded-full bg-[radial-gradient(circle_at_30%_28%,#f79840_0%,#d96a1a_30%,#056c95_68%,#033749_100%)] shadow-[0_40px_120px_-20px_rgba(5,108,149,0.55)] md:h-80 md:w-80"
    />
  );
}
