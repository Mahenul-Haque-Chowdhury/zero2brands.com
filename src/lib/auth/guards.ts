import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const ADMIN_ROLES = ["admin", "superadmin"] as const;
const STAFF_ROLES = ["admin", "superadmin", "instructor"] as const;

/**
 * Central role/access guards. Call at the top of every protected page,
 * layout, server action and route handler. Never inline `role === 'admin'`
 * checks elsewhere — that duplication is how one gets missed.
 *
 * Every guard here re-checks server-side; middleware is a first pass, not
 * the only check, per the build plan.
 */

export async function getCurrentUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, supabase };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile, supabase };
}

export async function requireUser() {
  const { user, profile, supabase } = await getCurrentUserAndProfile();
  if (!user) {
    redirect("/login");
  }
  if (profile?.is_banned) {
    redirect("/suspended");
  }
  return { user, profile, supabase };
}

export async function requireOnboarded() {
  const { user, profile, supabase } = await requireUser();
  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }
  return { user, profile: profile!, supabase };
}

export async function requireAdmin() {
  const { user, profile, supabase } = await requireUser();
  if (!profile || !ADMIN_ROLES.includes(profile.role as "admin" | "superadmin")) {
    redirect("/dashboard");
  }
  return { user, profile, supabase };
}

export async function requireStaff() {
  const { user, profile, supabase } = await requireUser();
  if (
    !profile ||
    !STAFF_ROLES.includes(
      profile.role as (typeof STAFF_ROLES)[number]
    )
  ) {
    redirect("/dashboard");
  }
  return { user, profile, supabase };
}

export async function requireSuperadmin() {
  const { user, profile, supabase } = await requireUser();
  if (!profile || profile.role !== "superadmin") {
    redirect("/management");
  }
  return { user, profile, supabase };
}

export async function requireCourseAccess(courseId: string) {
  const { user, profile, supabase } = await requireOnboarded();

  const { data: hasAccess } = await supabase.rpc("has_course_access", {
    uid: user.id,
    cid: courseId,
  });

  if (!hasAccess) {
    redirect("/course");
  }

  return { user, profile, supabase };
}

export async function requireLessonAccess(lessonId: string) {
  const { user, profile, supabase } = await requireOnboarded();

  const { data: canAccess } = await supabase.rpc("can_access_lesson", {
    uid: user.id,
    lid: lessonId,
  });

  if (!canAccess) {
    redirect("/dashboard/course");
  }

  return { user, profile, supabase };
}

export async function requireBatchAccess(batchId: string) {
  const { user, profile, supabase } = await requireOnboarded();

  const { data: hasAccess } = await supabase.rpc("has_batch_access", {
    uid: user.id,
    bid: batchId,
  });

  if (!hasAccess) {
    redirect("/dashboard/my-batches");
  }

  return { user, profile, supabase };
}

export async function requireEnrolledStudent() {
  const { user, profile, supabase } = await requireOnboarded();

  const { data: isEnrolled } = await supabase.rpc("is_enrolled_student", {
    uid: user.id,
  });

  if (!isEnrolled) {
    redirect("/dashboard");
  }

  return { user, profile, supabase };
}
