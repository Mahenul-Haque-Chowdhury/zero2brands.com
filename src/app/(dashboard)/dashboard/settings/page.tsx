import { requireOnboarded } from "@/lib/auth/guards";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { profile } = await requireOnboarded();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>
      <SettingsForm profile={profile} />
    </div>
  );
}
