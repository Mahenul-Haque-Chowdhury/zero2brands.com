import { requireUser } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
