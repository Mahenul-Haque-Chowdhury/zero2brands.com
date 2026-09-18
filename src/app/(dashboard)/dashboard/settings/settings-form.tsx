"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Smartphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function SettingsForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [businessName, setBusinessName] = useState(profile.business_name ?? "");
  const [businessCategory, setBusinessCategory] = useState(
    profile.business_category ?? ""
  );
  const [facebookUrl, setFacebookUrl] = useState(profile.facebook_url ?? "");
  const [showFacebook, setShowFacebook] = useState(profile.show_facebook);
  const [visibility, setVisibility] = useState(profile.visibility);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          bio,
          business_name: businessName || null,
          business_category: businessCategory || null,
          facebook_url: facebookUrl || null,
          show_facebook: showFacebook,
          visibility,
        })
        .eq("id", profile.id);

      if (error) {
        toast.error("Could not save settings.");
        return;
      }
      toast.success("Settings saved.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>
          <div className="grid gap-2">
            <Label>Business name</Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Business category</Label>
            <Input
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Facebook URL</Label>
            <Input
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Show Facebook link on my profile</p>
            <Switch checked={showFacebook} onCheckedChange={setShowFacebook} />
          </div>
          <div className="grid gap-2">
            <Label>Who can see your profile?</Label>
            <Select
              value={visibility}
              onValueChange={(v) =>
                setVisibility((v ?? "students_only") as Profile["visibility"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="students_only">Other students only</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private, hidden from directory</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Other enrolled students can see your name, district and business
              name depending on this setting.
            </p>
          </div>
          <Button onClick={handleSave} disabled={pending} className="mt-1 w-fit">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Smartphone className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Active devices</p>
              <p className="text-sm text-muted-foreground">
                See and sign out devices logged into your account.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            render={<Link href="/dashboard/settings/devices" />}
          >
            Manage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
