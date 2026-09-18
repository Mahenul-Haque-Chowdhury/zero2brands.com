import Link from "next/link";
import { PlayCircle, Radio, ArrowRight, CalendarDays } from "lucide-react";
import { requireOnboarded } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GrayVallyCta } from "@/components/dashboard/grayvally-cta";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export const metadata = { title: "Dashboard" };

const GRAYVALLY_CTA_THRESHOLD = 80;

/** Encouragement that tracks the progress number, so the ring reads as an
 *  achievement rather than a bare statistic. */
function progressNote(percent: number) {
  if (percent >= 100) return "Course complete. Outstanding work.";
  if (percent >= GRAYVALLY_CTA_THRESHOLD) return "Almost there, the finish line is in sight.";
  if (percent >= 50) return "Past the halfway mark and building momentum.";
  if (percent > 0) return "You have started. Keep the streak going.";
  return "Your first lesson is waiting.";
}

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
      <Reveal y={12}>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Continue where you left off.
        </p>
      </Reveal>

      <Reveal y={14} delay={0.05}>
        {primaryEnrollment ? (
          /* Progress is the emotional core of this page, so the ring gets a
             navy surface of its own rather than sitting in a plain card. */
          <div className="relative overflow-hidden rounded-xl bg-brand-hero p-6 sm:p-8">
            <div className="bg-brand-dots mask-fade-edges absolute inset-0" />
            <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
              <ProgressRing value={primaryEnrollment.progress_percent}>
                <span className="text-3xl font-semibold tabular-nums text-white">
                  {primaryEnrollment.progress_percent}
                  <span className="text-lg text-white/60">%</span>
                </span>
                <span className="text-[0.6875rem] tracking-wide text-white/50 uppercase">
                  Complete
                </span>
              </ProgressRing>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <span className="text-xs font-semibold tracking-wide text-accent uppercase">
                  Your course
                </span>
                <h2 className="mt-2 text-balance text-xl font-semibold text-white sm:text-2xl">
                  {primaryEnrollment.courses?.title}
                </h2>
                <p className="mt-2 text-sm text-white/65">
                  {progressNote(primaryEnrollment.progress_percent)}
                </p>
                <Link
                  href="/dashboard/course"
                  className="mt-5 inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-accent px-6 text-sm font-medium text-accent-foreground transition-all duration-200 hover:bg-accent/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1f35]"
                >
                  <PlayCircle className="size-4" />
                  Continue watching
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="size-4 text-accent" />
                Your course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have an active enrollment yet.{" "}
                <Link
                  href="/course"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  See the course
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </Reveal>

      {upcomingSessions && upcomingSessions.length > 0 ? (
        <Reveal y={14} delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="size-4 text-accent" />
                Upcoming live sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RevealGroup className="flex flex-col gap-1">
                {upcomingSessions.map((s) => (
                  <RevealItem key={s.id}>
                    <div className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-muted">
                      <span className="flex min-w-0 items-center gap-2.5">
                        <CalendarDays className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-accent" />
                        <span className="truncate font-medium">{s.title}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {new Date(s.scheduled_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </CardContent>
          </Card>
        </Reveal>
      ) : null}

      {primaryEnrollment && primaryEnrollment.progress_percent >= GRAYVALLY_CTA_THRESHOLD ? (
        <Reveal y={14} delay={0.12}>
          <GrayVallyCta />
        </Reveal>
      ) : null}
    </div>
  );
}
