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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Coupons</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Uses</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(coupons ?? []).map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono">{c.code}</TableCell>
              <TableCell>
                {c.discount_type === "percent"
                  ? `${c.discount_value}%`
                  : `৳${c.discount_value}`}
              </TableCell>
              <TableCell>
                {c.used_count}
                {c.max_uses ? `/${c.max_uses}` : ""}
              </TableCell>
              <TableCell>
                <Badge variant={c.is_active ? "default" : "secondary"}>
                  {c.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
