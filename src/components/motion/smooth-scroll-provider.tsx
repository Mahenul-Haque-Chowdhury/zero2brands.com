"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scrolling, mounted once in the root layout.
 *
 * Disabled entirely under prefers-reduced-motion: Lenis hijacks native
 * scroll, so honouring the preference means not starting it at all rather
 * than starting it with a shorter duration. The CSS `scroll-behavior:
 * smooth` in globals.css is also turned off under that query, so the two
 * never fight each other.
 */
export function SmoothScrollProvider() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    if (prefersReduced.matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Native touch scrolling stays untouched: overriding it on mobile
      // makes the page feel laggy and breaks pull-to-refresh.
      syncTouch: false,
    });

    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
