import { getCurrentUserAndProfile } from "@/lib/auth/guards";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";

/**
 * Resolves the session here rather than inside SiteHeader: the header is a
 * client component (it owns the mobile menu state), and the auth guards are
 * `server-only`. Reading it server-side also means the correct CTA renders
 * in the initial HTML instead of flashing "Log in" to a signed-in visitor.
 */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentUserAndProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader isAuthenticated={Boolean(user)} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
