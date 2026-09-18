import type { NextConfig } from "next";

// Security headers. CSP starts in report-only mode per Phase 14.1 of the
// build plan; flip Content-Security-Policy-Report-Only to
// Content-Security-Policy once violations have been reviewed in production.
const isDev = process.env.NODE_ENV !== "production";

const cspDirectives = [
  `default-src 'self'`,
  `frame-src 'self' https://iframe.mediadelivery.net https://*.mediadelivery.net https://checkout.pay.bka.sh https://checkout.sandbox.bka.sh https://tokenized.pay.bka.sh https://tokenized.sandbox.bka.sh`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://connect.facebook.net https://www.googletagmanager.com https://checkout.pay.bka.sh https://checkout.sandbox.bka.sh`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `img-src 'self' data: blob: https://*.b-cdn.net https://*.supabase.co https://www.facebook.com https://*.googleusercontent.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `media-src 'self' https://*.b-cdn.net`,
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://graph.facebook.com https://www.google-analytics.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://checkout.pay.bka.sh https://checkout.sandbox.bka.sh https://tokenized.pay.bka.sh https://tokenized.sandbox.bka.sh`,
  `frame-ancestors 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `upgrade-insecure-requests`,
];

const securityHeaders = [
  {
    key: "Content-Security-Policy-Report-Only",
    value: cspDirectives.join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
