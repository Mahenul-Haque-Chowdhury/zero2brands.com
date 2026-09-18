import { requireOnboarded } from "@/lib/auth/guards";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { profile } = await requireOnboarded();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and how it appears to other students.
        </p>
      </div>
      <SettingsForm profile={profile} />
    </div>
  );
}
