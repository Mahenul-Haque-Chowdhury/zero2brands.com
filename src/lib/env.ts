import "server-only";
/**
 * Server-only environment variable validation. Importing this file from any
 * client component or module that ends up in a client bundle is a build
 * failure thanks to the `server-only` guard above — that is deliberate.
 *
 * For public (NEXT_PUBLIC_*) values needed in the browser, import
 * `clientEnv` from `@/lib/env.client` instead. Keeping the two schemas in
 * separate files (rather than one file exporting both) means a client
 * bundle can never end up with the server schema's field-name strings
 * (or, if this guard were ever removed, its values) tree-shaken in
 * alongside the legitimately-public clientEnv import.
 */
import { z } from "zod";

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

type ServerEnv = z.infer<typeof serverSchema>;

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

export const serverEnv: ServerEnv = loadServerEnv();
