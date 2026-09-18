"use client";

import { useEffect, useState } from "react";
import { cn } from "cn";

const LINES = [
  {
    // No forced break: this wraps naturally at each breakpoint (3 lines on
    // narrow mobile, fewer as the viewport widens and font-size scales up
    // with it), same as the Bangla line below.
    text: "Build your own clothing brand, from zero.",
    lang: "en" as const,
    fontFamily: "var(--font-sen)",
    // Bengali glyphs run visually taller than Latin ones at the same
    // font-size (bigger x-height, conjuncts extend further), so the
    // Bangla line is set a notch smaller to read as the same size.
    fontSize: "1em",
    lineHeight: 1.1,
    className: "",
  },
  {
    text: "শূন্য থেকে নিজের ক্লোদিং ব্র্যান্ড তৈরী করুন আমাদের সাথে",
    lang: "bn" as const,
    fontFamily: "var(--font-bengali)",
    fontSize: "0.82em",
    // A touch more line-height than the English line: Bangla conjuncts and
    // matras sit closer to the line above/below at the same ratio, so this
    // line reads as cramped without a small bump.
    lineHeight: 1.35,
    // On narrow phones this text is short enough to fit 2 lines while the
    // longer English sentence wraps to 3, which looks mismatched inside
    // the fixed-height box. Capping the width on mobile only forces a 3rd
    // line there too; sm: and up removes the cap since both languages
    // already land on a similar line count at those widths.
    className: "max-w-[12rem] sm:max-w-none",
  },
];

const DISPLAY_MS = 3200;

/**
 * Loops the hero tagline between English and Bangla with a crossfade.
 *
 * Both lines are stacked in the same absolutely-positioned box at all
 * times (only opacity toggles) so the box never resizes between an
 * English one-liner and a Bangla two-liner — that resize was shifting
 * the whole hero section's height and causing a visible overlap/jump
 * during the transition. The wrapper's height is set by an invisible
 * "sizer" copy of whichever line is currently tallest, so the hero
 * section's height stays fixed too.
 *
 * Pure CSS opacity transition, no animation library, so it stays light
 * on mid-range Android. Respects prefers-reduced-motion by holding on
 * the first line and skipping the timer entirely.
 */
export function AnimatedTagline({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const interval = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % LINES.length);
        setVisible(true);
      }, 350);
    }, DISPLAY_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={className}
      style={{ display: "grid" }}
      role="text"
      aria-label="Build your own clothing brand, from zero."
    >
      {/* All lines share the same grid cell (both row 1 / column 1), so the
          box's height is the MAX of the lines, not their sum. Only the
          visible one has opacity 1; the rest are opacity 0 but still occupy
          the shared cell, which is what keeps the height fixed. The lines
          themselves are aria-hidden since the wrapper's aria-label already
          gives assistive tech one clean, static announcement. */}
      {LINES.map((line, i) => (
        <span
          key={line.lang}
          lang={line.lang}
          aria-hidden="true"
          className={cn("mx-auto", line.className)}
          style={{
            gridArea: "1 / 1",
            opacity: i === index && visible ? 1 : 0,
            transition: "opacity 350ms ease",
            fontFamily: line.fontFamily,
            fontSize: line.fontSize,
            lineHeight: line.lineHeight,
          }}
        >
          {line.text}
        </span>
      ))}
    </span>
  );
}
