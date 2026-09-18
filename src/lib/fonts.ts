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
