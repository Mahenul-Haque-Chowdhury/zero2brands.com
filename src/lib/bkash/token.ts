import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { bkashFetch } from "@/lib/bkash/http";
import type {
  BkashGrantTokenResponse,
  BkashRefreshTokenResponse,
} from "@/lib/bkash/types";

const SAFETY_MARGIN_SECONDS = 60;
const LOCK_KEY = "bkash_token_lock";
const LOCK_TTL_MS = 10_000;

/**
 * Distributed lock via Upstash Redis SET NX, so concurrent serverless
 * invocations don't each call Grant/Refresh Token simultaneously. Falls
 * back to no locking if Redis isn't configured (single-instance local dev
 * is fine without it; production must have Upstash configured).
 */
async function withTokenLock<T>(fn: () => Promise<T>): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return fn();
  }

  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url, token });

  const lockValue = crypto.randomUUID();
  let acquired = false;
  const deadline = Date.now() + LOCK_TTL_MS;

  while (Date.now() < deadline) {
    const result = await redis.set(LOCK_KEY, lockValue, {
      nx: true,
      px: LOCK_TTL_MS,
    });
    if (result === "OK") {
      acquired = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  try {
    return await fn();
  } finally {
    if (acquired) {
      const current = await redis.get(LOCK_KEY);
      if (current === lockValue) {
        await redis.del(LOCK_KEY);
      }
    }
  }
}

function computeExpiry(expiresInSeconds: number): string {
  return new Date(
    Date.now() + (expiresInSeconds - SAFETY_MARGIN_SECONDS) * 1000
  ).toISOString();
}

async function grantToken(): Promise<string> {
  const res = await bkashFetch<BkashGrantTokenResponse>("/token/grant", {
    method: "POST",
    headers: {
      username: serverEnv.BKASH_USERNAME ?? "",
      password: serverEnv.BKASH_PASSWORD ?? "",
    },
    body: {
      app_key: serverEnv.BKASH_APP_KEY,
      app_secret: serverEnv.BKASH_APP_SECRET,
    },
    skipAuth: true,
  });

  const admin = createAdminClient();
  await admin.from("bkash_tokens").upsert({
    id: 1,
    id_token: res.id_token,
    refresh_token: res.refresh_token,
    id_token_expires_at: computeExpiry(res.expires_in),
    // bKash refresh tokens live 28 days; store a conservative expiry.
    refresh_token_expires_at: new Date(
      Date.now() + 27 * 24 * 60 * 60 * 1000
    ).toISOString(),
    updated_at: new Date().toISOString(),
  });

  return res.id_token;
}

async function refreshToken(currentRefreshToken: string): Promise<string> {
  try {
    const res = await bkashFetch<BkashRefreshTokenResponse>(
      "/token/refresh",
      {
        method: "POST",
        headers: {
          username: serverEnv.BKASH_USERNAME ?? "",
          password: serverEnv.BKASH_PASSWORD ?? "",
        },
        body: {
          app_key: serverEnv.BKASH_APP_KEY,
          app_secret: serverEnv.BKASH_APP_SECRET,
          refresh_token: currentRefreshToken,
        },
        skipAuth: true,
      }
    );

    const admin = createAdminClient();
    await admin.from("bkash_tokens").upsert({
      id: 1,
      id_token: res.id_token,
      refresh_token: res.refresh_token,
      id_token_expires_at: computeExpiry(res.expires_in),
      refresh_token_expires_at: new Date(
        Date.now() + 27 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.id_token;
  } catch {
    // Refresh token itself may have expired; fall back to a fresh grant.
    return grantToken();
  }
}

/**
 * Returns a valid bKash id_token, refreshing or re-granting as needed.
 * Cached centrally in bkash_tokens (a single-row table, service_role only)
 * because serverless functions have no shared in-memory state.
 */
export async function getBkashToken(): Promise<string> {
  return withTokenLock(async () => {
    const admin = createAdminClient();
    const { data: cached } = await admin
      .from("bkash_tokens")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    const now = Date.now();

    if (
      cached?.id_token &&
      cached.id_token_expires_at &&
      new Date(cached.id_token_expires_at).getTime() > now
    ) {
      return cached.id_token;
    }

    if (
      cached?.refresh_token &&
      cached.refresh_token_expires_at &&
      new Date(cached.refresh_token_expires_at).getTime() > now
    ) {
      return refreshToken(cached.refresh_token);
    }

    return grantToken();
  });
}
