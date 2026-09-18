import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getBunnyVideoStatus, bunnyStatusLabel } from "@/lib/bunny/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  await requireAdmin();
  const { videoId } = await params;

  try {
    const status = await getBunnyVideoStatus(videoId);
    return NextResponse.json({
      status: bunnyStatusLabel(status.status),
      statusCode: status.status,
      durationSeconds: status.length,
      encodeProgress: status.encodeProgress,
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
