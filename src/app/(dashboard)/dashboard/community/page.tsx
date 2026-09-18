import { requireEnrolledStudent } from "@/lib/auth/guards";
import { CommunityDirectory } from "@/components/community/community-directory";

export const metadata = { title: "Community" };

export default async function CommunityPage() {
  // Gates on is_enrolled_student() — a signed-up-but-unpaid user never
  // reaches this far, redirected by requireEnrolledStudent to /dashboard.
  await requireEnrolledStudent();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Student Community</h1>
        <p className="text-muted-foreground">
          Meet other students building their businesses.
        </p>
      </div>
      <CommunityDirectory />
    </div>
  );
}
