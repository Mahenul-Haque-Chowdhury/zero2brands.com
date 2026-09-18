import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Weekly redundant backup: exports payments, enrollments and profiles to
 * CSV in a separate storage bucket, outside Supabase's own backup system
 * (Phase 14.8). This is a belt-and-braces measure — Supabase Pro's
 * point-in-time recovery is the primary backup; this is the second, fully
 * independent copy.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const timestamp = new Date().toISOString().slice(0, 10);

  const tables = ["payments", "enrollments", "profiles"] as const;
  const results: Record<string, { rows: number; uploaded: boolean }> = {};

  for (const table of tables) {
    const { data, error } = await admin.from(table).select("*");
    if (error || !data) {
      results[table] = { rows: 0, uploaded: false };
      continue;
    }

    const csv = toCsv(data as Record<string, unknown>[]);
    const path = `${timestamp}/${table}.csv`;

    const { error: uploadError } = await admin.storage
      .from("backups")
      .upload(path, csv, { contentType: "text/csv", upsert: true });

    results[table] = { rows: data.length, uploaded: !uploadError };
  }

  return NextResponse.json(results);
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];

  for (const row of rows) {
    const line = headers
      .map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",");
    lines.push(line);
  }

  return lines.join("\n");
}
