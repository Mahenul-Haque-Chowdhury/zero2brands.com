import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Account suspended" };

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Your account has been suspended</h1>
      <p className="max-w-md text-muted-foreground">
        If you believe this is a mistake, contact support at{" "}
        <a href="mailto:support@zero2brands.com" className="underline">
          support@zero2brands.com
        </a>
        .
      </p>
      <form action={logoutAction}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  );
}
