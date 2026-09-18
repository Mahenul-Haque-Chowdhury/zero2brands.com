import { requireOnboarded } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Dashboard" };

export default async function DashboardHomePage() {
  const { profile } = await requireOnboarded();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {profile.full_name ?? "there"}
        </h1>
        <p className="text-muted-foreground">
          Continue where you left off.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your course</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Head to the course to continue watching.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
