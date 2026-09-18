import { CheckCircle2, XCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificateNumber: string }>;
}) {
  const { certificateNumber } = await params;
  const admin = createAdminClient();

  // Public verification route: returns ONLY name, course and date, via the
  // service_role client rather than exposing certificates to anon in RLS.
  const { data: cert } = await admin
    .from("certificates")
    .select("certificate_number, issued_at, is_revoked, courses(title), profiles:user_id(full_name)")
    .eq("certificate_number", certificateNumber)
    .maybeSingle();

  const verified = Boolean(cert && !cert.is_revoked);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <span
        className={
          verified
            ? "flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent"
            : "flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive"
        }
      >
        {verified ? (
          <CheckCircle2 className="size-7" />
        ) : (
          <XCircle className="size-7" />
        )}
      </span>

      {verified && cert ? (
        <>
          <h1 className="mt-5 text-2xl font-semibold">
            Certificate verified
          </h1>
          <div className="mt-6 w-full rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-lg font-medium text-foreground">
              {cert.profiles?.full_name}
            </p>
            <p className="mt-1 text-muted-foreground">{cert.courses?.title}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Issued {new Date(cert.issued_at).toLocaleDateString()}
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {cert.certificate_number}
            </p>
          </div>
        </>
      ) : (
        <>
          <h1 className="mt-5 text-2xl font-semibold">
            Certificate not found
          </h1>
          <p className="mt-2 text-muted-foreground">
            This certificate number could not be verified.
          </p>
        </>
      )}
    </div>
  );
}
