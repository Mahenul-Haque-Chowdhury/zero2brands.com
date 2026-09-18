import { cn } from "cn";

/**
 * Brand lockup: "Zero" + a custom-styled "2" + "Brands", set in Poppins
 * ExtraBold. The "2" carries the brand green and a slight rotation/weight
 * bump so it reads as a distinct mark rather than a literal digit, per the
 * approved logo concept (Poppins ExtraBold 800 wordmark, Navy #0B1F35,
 * custom "2" glyph in Green #00C853).
 */
export function Wordmark({
  className,
  tagline,
  size = "md",
  onDark = false,
}: {
  className?: string;
  tagline?: string;
  size?: "sm" | "md" | "lg";
  /** Set true on navy/dark sidebar backgrounds so "Zero"/"Brands" render light. */
  onDark?: boolean;
}) {
  const sizeClass = {
    sm: "text-base",
    md: "text-[1.375rem]",
    lg: "text-3xl",
  }[size];

  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className={cn(
          "font-extrabold tracking-tight",
          sizeClass,
          onDark ? "text-white" : "text-primary"
        )}
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        Zero
        <span
          className="inline-block text-accent"
          style={{ fontWeight: 900, transform: "translateY(-0.03em)" }}
        >
          2
        </span>
        Brands
      </span>
      {tagline ? (
        <span
          className={cn(
            "mt-0.5 text-[0.6875rem] font-normal uppercase",
            onDark ? "text-white/60" : "text-primary/70"
          )}
          style={{ fontFamily: "var(--font-poppins)", letterSpacing: "0.14em" }}
        >
          {tagline}
        </span>
      ) : null}
    </span>
  );
}
