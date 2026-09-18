import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Log in to continue your course.
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
