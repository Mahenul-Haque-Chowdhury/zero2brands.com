"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export async function banStudentAction(formData: FormData) {
  const { user } = await requireAdmin();
  const studentId = String(formData.get("studentId"));
  const reason = String(formData.get("reason") ?? "");

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ is_banned: true, ban_reason: reason })
    .eq("id", studentId);

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "student_banned",
    entity_type: "profile",
    entity_id: studentId,
    after: { reason },
  });

  revalidatePath(`/admin/students/${studentId}`);
}

export async function unbanStudentAction(formData: FormData) {
  const { user } = await requireAdmin();
  const studentId = String(formData.get("studentId"));

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ is_banned: false, ban_reason: null })
    .eq("id", studentId);

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "student_unbanned",
    entity_type: "profile",
    entity_id: studentId,
  });

  revalidatePath(`/admin/students/${studentId}`);
}

export async function signOutAllDevicesAction(formData: FormData) {
  const { user } = await requireAdmin();
  const studentId = String(formData.get("studentId"));

  const admin = createAdminClient();
  await admin.from("active_sessions").delete().eq("user_id", studentId);

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "admin_signed_out_all_devices",
    entity_type: "profile",
    entity_id: studentId,
  });

  revalidatePath(`/admin/students/${studentId}`);
}

export async function grantCourseAccessAction(formData: FormData) {
  const { user } = await requireAdmin();
  const studentId = String(formData.get("studentId"));
  const courseId = String(formData.get("courseId"));

  const admin = createAdminClient();
  await admin.from("enrollments").upsert(
    { user_id: studentId, course_id: courseId, status: "active" },
    { onConflict: "user_id,course_id" }
  );

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "admin_granted_course_access",
    entity_type: "enrollment",
    after: { studentId, courseId },
  });

  revalidatePath(`/admin/students/${studentId}`);
}

export async function revokeCourseAccessAction(formData: FormData) {
  const { user } = await requireAdmin();
  const studentId = String(formData.get("studentId"));
  const courseId = String(formData.get("courseId"));
  const reason = String(formData.get("reason") ?? "admin_revoked");

  const admin = createAdminClient();
  await admin
    .from("enrollments")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_reason: reason,
    })
    .eq("user_id", studentId)
    .eq("course_id", courseId);

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "admin_revoked_course_access",
    entity_type: "enrollment",
    after: { studentId, courseId, reason },
  });

  revalidatePath(`/admin/students/${studentId}`);
}
