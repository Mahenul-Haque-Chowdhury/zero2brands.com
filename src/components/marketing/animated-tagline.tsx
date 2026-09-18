"use client";

import { useEffect, useState } from "react";

const LINES = [
  { text: "Build your own clothing brand, from zero.", lang: "en" },
  { text: "শূন্য থেকে নিজের ব্র্যান্ড তৈরী করুন আমাদের সাথে", lang: "bn" },
] as const;

const DISPLAY_MS = 3200;

/**
 * Loops the hero tagline between English and Bangla with a crossfade.
 * Pure CSS opacity transition, no animation library, so it stays light on
 * mid-range Android. Respects prefers-reduced-motion by holding on the
 * first line and skipping the timer entirely.
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

  const current = LINES[index];

  return (
    <span
      className={className}
      lang={current.lang}
      style={{
        display: "inline-block",
        opacity: visible ? 1 : 0,
        transition: "opacity 350ms ease",
      }}
    >
      {current.text}
    </span>
  );
}
