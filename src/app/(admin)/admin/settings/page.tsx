import { requireAdmin } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2 } from "lucide-react";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data: settings } = await supabase.from("site_settings").select("*");

  const rows = settings ?? [];

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-sans text-xl font-semibold">Site settings</h1>
        <p className="text-sm text-muted-foreground">
          Raw configuration stored in site_settings.
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="grid gap-3">
          {rows.map((s) => (
            <Card key={s.key} size="sm">
              <CardHeader>
                <CardTitle className="font-mono text-xs font-medium text-foreground">
                  {s.key}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  {JSON.stringify(s.value, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <Settings2 className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">No settings configured</p>
        </div>
      )}
    </div>
  );
}
