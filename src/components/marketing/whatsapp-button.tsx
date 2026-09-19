const WHATSAPP_NUMBER = "8801912051579";
const DEFAULT_MESSAGE = "Hi, I have a question about Zero2Brands.";

/**
 * Fixed floating WhatsApp button, bottom-right, present on every marketing
 * page via the marketing layout. Plain server-renderable anchor, no client
 * JS needed for a wa.me link.
 */
export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      // Raised on mobile so it clears the course page's sticky full-width
      // buy bar (fixed bottom-0, ~70px tall, mobile-only). That bar exists
      // on one page, but this button is global, so the clearance is
      // applied everywhere below md rather than per-page.
      className="fixed bottom-24 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl active:scale-95 md:bottom-6 md:right-6 md:z-50"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-7"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.09c-.24.68-1.19 1.25-1.95 1.41-.52.11-1.19.2-3.46-.74-2.9-1.2-4.77-4.15-4.92-4.34-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.24-.26.53-.32.71-.32.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.56.81 1.94.88 2.08.07.14.11.3.02.49-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.61-.07.16-.19.68-.79.87-1.06.18-.27.36-.22.6-.13.25.09 1.58.75 1.85.88.27.13.45.2.51.31.07.11.07.65-.17 1.33Z" />
      </svg>
    </a>
  );
}
