import Image from "next/image";
import { cn } from "cn";

/**
 * Brand logo file (public/zero2brands.png) is white wordmark text with a
 * green arrow-Z glyph, transparent background — designed for a dark/navy
 * surface. Wrapped in a small navy chip so it stays legible when placed on
 * the app's light header/footer backgrounds, per the owner-supplied asset.
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
  /** Set true when the surrounding surface is already navy/dark (e.g. the
   *  dashboard/admin sidebars) so the logo isn't wrapped in a redundant chip. */
  onDark?: boolean;
}) {
  const dims = {
    sm: { width: 118, height: 39, padding: "px-2 py-1.5" },
    md: { width: 163, height: 54, padding: "px-3 py-2" },
    lg: { width: 217, height: 72, padding: "px-4 py-2.5" },
  }[size];

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-md",
          onDark ? "" : cn("bg-primary", dims.padding)
        )}
      >
        <Image
          src="/zero2brands.png"
          alt="Zero2Brands"
          width={dims.width}
          height={dims.height}
          priority
          className="h-auto w-full"
        />
      </span>
      {tagline ? (
        <span
          className={cn(
            "mt-1 text-[0.6875rem] font-normal uppercase",
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
