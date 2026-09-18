/**
 * GrayVally Software Solutions wordmark, set in type rather than shipped
 * as an image: we have no logo file for the partner in this repo, and a
 * text lockup is honest about that while still reading as a brand mark.
 * Swap for the real logo asset once it is supplied.
 */
export function GrayVallyWordmark({ className }: { className?: string }) {
  return (
    <span
      className={className}
      style={{ fontFamily: "var(--font-poppins)" }}
    >
      <span className="font-extrabold tracking-tight">Gray</span>
      <span className="font-extrabold tracking-tight text-accent">Vally</span>
    </span>
  );
}
