import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GrayVallyCta } from "@/components/dashboard/grayvally-cta";

export const metadata = { title: "Dashboard" };

const GRAYVALLY_CTA_THRESHOLD = 80;

export default async function DashboardHomePage() {
  const { user, profile, supabase } = await requireOnboarded();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("progress_percent, courses(title, slug)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);

  const primaryEnrollment = enrollments?.[0];

  const { data: upcomingSessions } = await supabase
    .from("live_sessions")
    .select("id, title, scheduled_at, batch_id")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at")
    .limit(3);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {profile.full_name ?? "there"}
        </h1>
        <p className="text-muted-foreground">Continue where you left off.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your course</CardTitle>
        </CardHeader>
        <CardContent>
          {primaryEnrollment ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm">{primaryEnrollment.courses?.title}</p>
              <Progress value={primaryEnrollment.progress_percent} />
              <p className="text-xs text-muted-foreground">
                {primaryEnrollment.progress_percent}% complete
              </p>
              <Link href="/dashboard/course" className="mt-2 w-fit text-sm underline">
                Continue watching
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You don&apos;t have an active enrollment yet.{" "}
              <Link href="/course" className="underline">
                See the course
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {upcomingSessions && upcomingSessions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming live sessions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {upcomingSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.title}</span>
                <span className="text-muted-foreground">
                  {new Date(s.scheduled_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {primaryEnrollment && primaryEnrollment.progress_percent >= GRAYVALLY_CTA_THRESHOLD ? (
        <GrayVallyCta />
      ) : null}
    </div>
  );
}
