import "server-only";
import { createHash } from "node:crypto";
import { serverEnv } from "@/lib/env";

const TOKEN_EXPIRY_SECONDS = 3 * 60 * 60; // 3 hours

/**
 * Generates a Bunny Stream embed token. Formula per Bunny's Token
 * Authentication spec: SHA256(token_key + video_id + expiry_unix).
 *
 * Never call this client-side and never return the token key itself —
 * only the signed URL.
 */
export function generateBunnyVideoToken(videoId: string): {
  token: string;
  expires: number;
} {
  if (!serverEnv.BUNNY_STREAM_TOKEN_KEY) {
    throw new Error("BUNNY_STREAM_TOKEN_KEY is not configured");
  }

  const expires = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS;
  const hashSource = `${serverEnv.BUNNY_STREAM_TOKEN_KEY}${videoId}${expires}`;
  const token = createHash("sha256").update(hashSource).digest("hex");

  return { token, expires };
}

export function buildSignedEmbedUrl(videoId: string): {
  url: string;
  expiresAt: string;
} {
  const { token, expires } = generateBunnyVideoToken(videoId);
  const libraryId = serverEnv.BUNNY_STREAM_LIBRARY_ID;

  const url = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`;

  return { url, expiresAt: new Date(expires * 1000).toISOString() };
}

/**
 * Direct HLS playlist URL, signed the same way as the embed token. Not
 * currently used by the player (which uses the iframe embed exclusively
 * per Phase 5.3 — "do not build a custom HLS player"), kept available for
 * any future custom-player need.
 */
export function buildSignedDirectPlayUrl(videoId: string): {
  url: string;
  expiresAt: string;
} {
  const { token, expires } = generateBunnyVideoToken(videoId);
  const cdnHostname = serverEnv.BUNNY_STREAM_CDN_HOSTNAME;

  const url = `https://${cdnHostname}/${videoId}/playlist.m3u8?token=${token}&expires=${expires}`;

  return { url, expiresAt: new Date(expires * 1000).toISOString() };
}
