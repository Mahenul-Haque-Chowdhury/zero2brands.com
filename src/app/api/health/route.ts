import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("site_settings")
      .select("key")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { status: "error", database: "unreachable" },
        { status: 503 }
      );
    }

    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json(
      { status: "error", database: "unreachable" },
      { status: 503 }
    );
  }
}
