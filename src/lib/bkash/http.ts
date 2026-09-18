import "server-only";
import { serverEnv } from "@/lib/env";

const TIMEOUT_MS = 30_000;

interface BkashFetchOptions {
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  /** Skip attaching the Authorization/X-APP-Key headers (token grant/refresh calls). */
  skipAuth?: boolean;
  /** Attach the current id_token explicitly (avoids importing token.ts in itself). */
  idToken?: string;
}

/**
 * Low-level bKash HTTP client.
 *
 * - Authorization header is the RAW id_token with NO "Bearer" prefix. This
 *   is a documented bKash quirk that trips people up — do not "fix" it.
 * - Every call gets a 30 second timeout, bKash's documented expectation.
 * - If BKASH_PROXY_URL is set (see Phase 0.6 / 4.1 of the build plan — an
 *   IP-whitelisting workaround), requests are routed through it instead of
 *   calling bKash directly. The proxy is a dumb relay: it forwards the
 *   method/path/body/headers to BKASH_BASE_URL and requires a shared
 *   secret header, nothing more.
 */
export async function bkashFetch<T>(
  path: string,
  options: BkashFetchOptions
): Promise<T> {
  const targetBase = serverEnv.BKASH_PROXY_URL || serverEnv.BKASH_BASE_URL;
  const url = `${targetBase}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  if (!options.skipAuth) {
    if (options.idToken) {
      headers["Authorization"] = options.idToken; // no "Bearer " prefix
    }
    headers["X-APP-Key"] = serverEnv.BKASH_APP_KEY ?? "";
  }

  if (serverEnv.BKASH_PROXY_URL && serverEnv.BKASH_PROXY_SECRET) {
    headers["X-Proxy-Secret"] = serverEnv.BKASH_PROXY_SECRET;
    headers["X-Proxy-Target-Base"] = serverEnv.BKASH_BASE_URL;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new BkashApiError(
        `bKash request to ${path} failed with status ${res.status}`,
        json
      );
    }

    return json as T;
  } finally {
    clearTimeout(timeout);
  }
}

export class BkashApiError extends Error {
  constructor(
    message: string,
    public readonly response: unknown
  ) {
    super(message);
    this.name = "BkashApiError";
  }
}

/** Convenience wrapper that attaches the current cached id_token. */
export async function bkashAuthedFetch<T>(
  path: string,
  options: Omit<BkashFetchOptions, "skipAuth" | "idToken">
): Promise<T> {
  const { getBkashToken } = await import("@/lib/bkash/token");
  const idToken = await getBkashToken();
  return bkashFetch<T>(path, { ...options, idToken });
}
