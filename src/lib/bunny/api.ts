import "server-only";
import { createHash } from "node:crypto";
import { serverEnv } from "@/lib/env";

const BUNNY_API_BASE = "https://video.bunnycdn.com/library";

function libraryUrl(path: string): string {
  return `${BUNNY_API_BASE}/${serverEnv.BUNNY_STREAM_LIBRARY_ID}${path}`;
}

function authHeaders(): Record<string, string> {
  return {
    AccessKey: serverEnv.BUNNY_STREAM_API_KEY ?? "",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export interface BunnyCreateVideoResponse {
  guid: string;
  title: string;
  videoLibraryId: number;
}

/** Creates a video object in the library so the browser can upload directly to it via TUS. */
export async function createBunnyVideoObject(title: string): Promise<BunnyCreateVideoResponse> {
  const res = await fetch(libraryUrl("/videos"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    throw new Error(`Bunny createVideo failed: ${res.status}`);
  }
  return res.json();
}

export interface BunnyVideoStatus {
  guid: string;
  status: number; // 0=created,1=uploaded,2=processing,3=transcoding,4=finished,5=error
  length: number; // seconds
  encodeProgress: number;
  title: string;
}

const STATUS_LABELS: Record<number, string> = {
  0: "created",
  1: "uploaded",
  2: "processing",
  3: "transcoding",
  4: "finished",
  5: "error",
};

export function bunnyStatusLabel(status: number): string {
  return STATUS_LABELS[status] ?? "unknown";
}

export async function getBunnyVideoStatus(guid: string): Promise<BunnyVideoStatus> {
  const res = await fetch(libraryUrl(`/videos/${guid}`), {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Bunny getVideoStatus failed: ${res.status}`);
  }
  return res.json();
}

export async function deleteBunnyVideo(guid: string): Promise<void> {
  const res = await fetch(libraryUrl(`/videos/${guid}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Bunny deleteVideo failed: ${res.status}`);
  }
}

/**
 * Builds the TUS upload signature Bunny's resumable upload protocol
 * expects. The browser uploads DIRECTLY to Bunny using this signature —
 * never proxied through our server, so a 500MB file on a flaky connection
 * doesn't die mid-transfer through a serverless function with a body-size
 * limit.
 *
 * Signature formula per Bunny docs: SHA256(library_id + api_key + expires + video_id)
 */
export function buildTusUploadSignature(params: {
  videoId: string;
  expiresUnix: number;
}): { signature: string; libraryId: string; expires: number } {
  const raw = `${serverEnv.BUNNY_STREAM_LIBRARY_ID}${serverEnv.BUNNY_STREAM_API_KEY}${params.expiresUnix}${params.videoId}`;
  const signature = createHash("sha256").update(raw).digest("hex");
  return {
    signature,
    libraryId: serverEnv.BUNNY_STREAM_LIBRARY_ID ?? "",
    expires: params.expiresUnix,
  };
}
