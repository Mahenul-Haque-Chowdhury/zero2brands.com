import Link from "next/link";
import { PlayCircle, Radio, ArrowRight } from "lucide-react";
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

  const firstName = (profile.full_name ?? "there").split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Continue where you left off.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="size-4 text-accent" />
            Your course
          </CardTitle>
        </CardHeader>
        <CardContent>
          {primaryEnrollment ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                {primaryEnrollment.courses?.title}
              </p>
              <div className="flex flex-col gap-1.5">
                <Progress value={primaryEnrollment.progress_percent} />
                <p className="text-xs text-muted-foreground">
                  {primaryEnrollment.progress_percent}% complete
                </p>
              </div>
              <Link
                href="/dashboard/course"
                className="mt-1 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Continue watching
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You don&apos;t have an active enrollment yet.{" "}
              <Link
                href="/course"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                See the course
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {upcomingSessions && upcomingSessions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="size-4 text-accent" />
              Upcoming live sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {upcomingSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <span className="font-medium">{s.title}</span>
                <span className="shrink-0 text-muted-foreground">
                  {new Date(s.scheduled_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
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
