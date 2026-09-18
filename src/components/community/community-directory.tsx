"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 20;

interface DirectoryEntry {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  district: string | null;
  business_name: string | null;
  business_category: string | null;
}

export function CommunityDirectory() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const supabase = createClient();
      // Reads ONLY public_profiles — never the base profiles table. This
      // view already excludes email, phone, role, is_banned, admin_notes
      // and gates on is_enrolled_student() in its WHERE clause.
      let query = supabase
        .from("public_profiles")
        .select(
          "id, username, full_name, avatar_url, district, business_name, business_category"
        )
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

      if (search.trim()) {
        query = query.or(
          `full_name.ilike.%${search.trim()}%,business_name.ilike.%${search.trim()}%`
        );
      }
      if (district !== "all") {
        query = query.eq("district", district);
      }

      const { data } = await query;
      const rows = (data ?? []).filter(
        (r): r is DirectoryEntry => r.id !== null
      );
      setHasMore(rows.length > PAGE_SIZE);
      setEntries(rows.slice(0, PAGE_SIZE));
    });
  }, [search, district, page]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Search by name or business…"
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          className="sm:max-w-xs"
        />
        <Select
          value={district}
          onValueChange={(v) => {
            setPage(0);
            setDistrict(v ?? "all");
          }}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="All districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All districts</SelectItem>
            {[
              "Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet",
              "Barishal", "Rangpur", "Mymensingh",
            ].map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No students found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/dashboard/community/${entry.username}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 pt-6">
                  <Avatar>
                    <AvatarImage src={entry.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {entry.full_name?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{entry.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.business_name ?? entry.district ?? ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
