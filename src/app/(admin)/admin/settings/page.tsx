import { requireAdmin } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data: settings } = await supabase.from("site_settings").select("*");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Site settings</h1>
      <div className="grid gap-4">
        {(settings ?? []).map((s) => (
          <Card key={s.key}>
            <CardHeader>
              <CardTitle className="text-sm font-mono">{s.key}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto text-xs text-muted-foreground">
                {JSON.stringify(s.value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
