import localFont from "next/font/local";

/**
 * Poppins, self-hosted as static files rather than next/font/google.
 * A prior next/font/google setup caused dev-server crashes when the
 * live fetch to fonts.gstatic.com timed out; self-hosting removes that
 * runtime network dependency entirely. Used only for the wordmark/brand
 * lockup, not body copy.
 */
export const poppins = localFont({
  src: [
    { path: "../../public/fonts/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Poppins-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/Poppins-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

/**
 * Sen, self-hosted the same way as Poppins. This is the site-wide UI/body
 * font (headings, nav, buttons, copy) — see globals.css where --font-sans
 * and --font-heading are pointed at --font-sen.
 */
export const sen = localFont({
  src: [
    { path: "../../public/fonts/Sen-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Sen-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Sen-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Sen-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Sen-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-sen",
  display: "swap",
});
