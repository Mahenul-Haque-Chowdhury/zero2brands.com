import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tag } from "lucide-react";

export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  await requireAdmin();
  // coupons has NO client-readable policies at all (deny-all by design, see
  // 0002_rls_policies.sql Section 7) — even an admin's anon-key session
  // cannot select it, so the admin UI reads it via the service_role client
  // after the requireAdmin() role check above.
  const admin = createAdminClient();
  const { data: coupons } = await admin
    .from("coupons")
    .select("id, code, discount_type, discount_value, used_count, max_uses, is_active")
    .order("created_at", { ascending: false });

  const rows = coupons ?? [];

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-sans text-xl font-semibold">Coupons</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} coupon{rows.length === 1 ? "" : "s"} configured.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Code
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Discount
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Uses
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs font-medium">{c.code}</TableCell>
                <TableCell className="text-muted-foreground">
                  {c.discount_type === "percent"
                    ? `${c.discount_value}%`
                    : `৳${c.discount_value}`}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {c.used_count}
                  {c.max_uses ? `/${c.max_uses}` : ""}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      c.is_active
                        ? "border-accent/20 bg-accent/10 text-accent"
                        : "text-muted-foreground"
                    }
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="p-0">
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Tag className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No coupons yet</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
