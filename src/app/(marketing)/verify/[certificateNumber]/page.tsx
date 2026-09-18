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

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      {cert && !cert.is_revoked ? (
        <>
          <h1 className="text-2xl font-semibold">Certificate Verified</h1>
          <div className="mt-6 rounded-lg border p-6">
            <p className="text-lg font-medium">{cert.profiles?.full_name}</p>
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
          <h1 className="text-2xl font-semibold">Certificate Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            This certificate number could not be verified.
          </p>
        </>
      )}
    </div>
  );
}
