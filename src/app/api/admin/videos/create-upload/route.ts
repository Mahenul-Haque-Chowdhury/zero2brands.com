import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { createBunnyVideoObject, buildTusUploadSignature } from "@/lib/bunny/api";

const bodySchema = z.object({
  title: z.string().trim().min(1).max(200),
});

/**
 * Admin-only. Creates a video object in Bunny and returns a short-lived TUS
 * upload signature. The browser then uploads DIRECTLY to Bunny using
 * tus-js-client — never proxied through this server, so large files on a
 * flaky connection can resume rather than dying at 80%.
 */
export async function POST(request: NextRequest) {
  await requireAdmin();

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const video = await createBunnyVideoObject(parsed.data.title);

  const expiresUnix = Math.floor(Date.now() / 1000) + 3600; // 1 hour to start the upload
  const { signature, libraryId, expires } = buildTusUploadSignature({
    videoId: video.guid,
    expiresUnix,
  });

  // Deliberately does NOT return the raw Bunny API key. Bunny's TUS
  // implementation authenticates the resumable upload via the
  // AuthorizationSignature/AuthorizationExpire/VideoId/LibraryId headers
  // below (per their docs), not the account API key, so the browser never
  // needs to see it.
  return NextResponse.json({
    videoId: video.guid,
    tusEndpoint: "https://video.bunnycdn.com/tusupload",
    libraryId,
    signature,
    expires,
  });
}
