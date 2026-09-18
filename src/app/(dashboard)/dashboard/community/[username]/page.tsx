import { notFound } from "next/navigation";
import { requireEnrolledStudent } from "@/lib/auth/guards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-xl">
            {profile.full_name?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{profile.full_name}</h1>
          {profile.business_name ? (
            <p className="text-sm text-muted-foreground">
              {profile.business_name}
              {profile.business_category ? ` · ${profile.business_category}` : ""}
            </p>
          ) : null}
          {profile.district ? (
            <p className="text-sm text-muted-foreground">{profile.district}</p>
          ) : null}
        </div>
      </div>

      {profile.bio ? <p className="mt-4 text-sm">{profile.bio}</p> : null}

      {profile.facebook_url ? (
        <a
          href={profile.facebook_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm underline"
        >
          Facebook
        </a>
      ) : null}

      {profile.created_at ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Member since {new Date(profile.created_at).toLocaleDateString()}
        </p>
      ) : null}

      {profile.id && profile.id !== user.id ? (
        <div className="mt-6">
          <ReportProfileButton reportedUserId={profile.id} />
        </div>
      ) : null}
    </div>
  );
}
