/**
 * Environment variable validation.
 *
 * Server variables are validated eagerly at import time so a missing secret
 * fails the build / boot rather than surfacing as a runtime crash deep in a
 * request handler. Client variables are validated separately and must never
 * import server-only values.
 *
 * Do NOT import `serverEnv` from any file that ends up in a client bundle.
 * Files that only need public values should import `clientEnv`.
 */
import { z } from "zod";

// Treats an empty string the same as "unset" so optional env vars left
// blank in .env.local (as .env.example encourages) don't fail validation.
const optionalString = () =>
  z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().min(1).optional()
  );

const serverSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: optionalString(),
  DIRECT_URL: optionalString(),

  // Bunny Stream
  BUNNY_STREAM_LIBRARY_ID: z.string().optional(),
  BUNNY_STREAM_API_KEY: z.string().optional(),
  BUNNY_STREAM_TOKEN_KEY: z.string().optional(),
  BUNNY_STREAM_CDN_HOSTNAME: z.string().optional(),
  BUNNY_ACCOUNT_API_KEY: z.string().optional(),

  // bKash
  BKASH_BASE_URL: z.string().url().default(
    "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout"
  ),
  BKASH_APP_KEY: z.string().optional(),
  BKASH_APP_SECRET: z.string().optional(),
  BKASH_USERNAME: z.string().optional(),
  BKASH_PASSWORD: z.string().optional(),
  BKASH_IS_SANDBOX: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
  BKASH_PROXY_URL: z.string().optional(),
  BKASH_PROXY_SECRET: z.string().optional(),

  // Resend
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Zero2Brands <noreply@zero2brands.com>"),
  EMAIL_REPLY_TO: z.string().default("support@zero2brands.com"),

  // SMS
  SMS_API_URL: z.string().optional(),
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER_ID: z.string().optional(),

  // Zoom
  ZOOM_ACCOUNT_ID: z.string().optional(),
  ZOOM_CLIENT_ID: z.string().optional(),
  ZOOM_CLIENT_SECRET: z.string().optional(),

  // Meta
  META_CAPI_ACCESS_TOKEN: z.string().optional(),
  META_TEST_EVENT_CODE: z.string().optional(),

  // Google
  GOOGLE_SITE_VERIFICATION: z.string().optional(),

  // Sentry
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // Upstash
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Security
  CRON_SECRET: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

function loadServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "Invalid server environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid server environment variables. See log above.");
  }
  return parsed.data;
}

function loadClientEnv(): ClientEnv {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    NEXT_PUBLIC_GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
  if (!parsed.success) {
    console.error(
      "Invalid client environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid client environment variables. See log above.");
  }
  return parsed.data;
}

// Client env is always safe to compute (public values only).
export const clientEnv = loadClientEnv();

// Server env must never be imported into a client component/bundle.
// We lazily validate on first access on the server so importing this module
// from a route file that is statically analyzed as server-only is safe, but
// we still eagerly validate here since this file itself is never marked
// "use client" and Next.js will fail the build if it ends up in a client
// chunk that references process.env server keys incorrectly.
export const serverEnv: ServerEnv = loadServerEnv();
