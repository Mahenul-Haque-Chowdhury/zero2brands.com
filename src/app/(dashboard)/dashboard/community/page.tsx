import { requireEnrolledStudent } from "@/lib/auth/guards";
import { CommunityDirectory } from "@/components/community/community-directory";

export const metadata = { title: "Community" };

export default async function CommunityPage() {
  // Gates on is_enrolled_student() — a signed-up-but-unpaid user never
  // reaches this far, redirected by requireEnrolledStudent to /dashboard.
  await requireEnrolledStudent();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Student Community</h1>
        <p className="mt-1 text-muted-foreground">
          Meet other students building their businesses.
        </p>
      </div>
      <CommunityDirectory />
    </div>
  );
}
