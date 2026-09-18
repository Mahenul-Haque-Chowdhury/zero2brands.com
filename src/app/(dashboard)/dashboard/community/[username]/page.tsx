import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { requireEnrolledStudent } from "@/lib/auth/guards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ReportProfileButton } from "@/components/community/report-profile-button";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { user, supabase } = await requireEnrolledStudent();

  // Reads ONLY public_profiles. A `private` profile is excluded from this
  // view's WHERE clause, so it naturally 404s here rather than needing a
  // separate visibility check.
  const { data: profile } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-accent/20 ring-offset-2 ring-offset-card">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-accent/10 text-xl font-semibold text-accent">
                {profile.full_name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">
                {profile.full_name}
              </h1>
              {profile.business_name ? (
                <p className="text-sm text-muted-foreground">
                  {profile.business_name}
                  {profile.business_category
                    ? `, ${profile.business_category}`
                    : ""}
                </p>
              ) : null}
              {profile.district ? (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {profile.district}
                </p>
              ) : null}
            </div>
          </div>

          {profile.bio ? (
            <p className="mt-5 border-t border-border pt-5 text-sm leading-relaxed">
              {profile.bio}
            </p>
          ) : null}

          {profile.facebook_url ? (
            <a
              href={profile.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Facebook
            </a>
          ) : null}

          {profile.created_at ? (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              Member since{" "}
              {new Date(profile.created_at).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </p>
          ) : null}

          {profile.id && profile.id !== user.id ? (
            <div className="mt-6 border-t border-border pt-4">
              <ReportProfileButton reportedUserId={profile.id} />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
