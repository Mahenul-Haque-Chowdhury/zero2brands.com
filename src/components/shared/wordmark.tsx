import Image from "next/image";
import { cn } from "cn";

/**
 * Brand logo file (public/zero2brands.png): white wordmark text with a
 * green arrow-Z glyph, transparent background. Rendered as-is, no
 * background chip, per the owner's asset.
 */
export function Wordmark({
  className,
  tagline,
  size = "md",
}: {
  className?: string;
  tagline?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: { width: 118, height: 39 },
    md: { width: 163, height: 54 },
    lg: { width: 217, height: 72 },
  }[size];

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <Image
        src="/zero2brands.png"
        alt="Zero2Brands"
        width={dims.width}
        height={dims.height}
        priority
        className="h-auto w-full"
      />
      {tagline ? (
        <span
          className="mt-1 text-[0.6875rem] font-normal uppercase text-white/60"
          style={{ fontFamily: "var(--font-poppins)", letterSpacing: "0.14em" }}
        >
          {tagline}
        </span>
      ) : null}
    </span>
  );
}
