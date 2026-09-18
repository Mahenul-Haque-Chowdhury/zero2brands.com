import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tag } from "lucide-react";
import {
  Th,
  TableSurface,
  EmptyState,
  PageHeading,
} from "@/components/admin/data-table";

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
      <PageHeading
        title="Coupons"
        description={`${rows.length} coupon${rows.length === 1 ? "" : "s"} configured.`}
      />

      <TableSurface>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <Th>Code</Th>
              <Th>Discount</Th>
              <Th align="right">Uses</Th>
              <Th>Status</Th>
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
                  <EmptyState
                    icon={Tag}
                    title="No coupons yet"
                    hint="Discount codes you create will be listed here."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableSurface>
    </div>
  );
}
