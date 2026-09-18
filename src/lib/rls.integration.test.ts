import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "pg";

/**
 * RLS integration tests against a local Supabase Postgres instance.
 * Per Phase 15.1 of the build plan, these are "the highest-value tests in
 * the project" — write them before trusting the schema.
 *
 * Requires `supabase start` running locally (the default local connection
 * string below matches the Supabase CLI's default Postgres port 54322).
 * Run with `npm run test:integration`. Not part of the default `npm run
 * test`, since it needs Docker.
 *
 * These tests connect as the Postgres superuser to set up fixtures and to
 * run each check AS a specific Postgres role (anon/authenticated) with a
 * specific auth.uid() via `set local role` and
 * `set local request.jwt.claims`, mirroring exactly how PostgREST enforces
 * RLS for real API requests.
 */

const CONNECTION_STRING =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

let client: Client;

// `set local` only applies for the duration of the current transaction
// block, so every scoped query below runs inside an explicit
// BEGIN...ROLLBACK. Without the transaction wrapper, `set local role`
// silently no-ops on the next statement and the query runs as the
// superuser, defeating the whole point of these tests.
async function runAsRole<T>(
  uid: string | null,
  role: "anon" | "authenticated",
  fn: () => Promise<T>
): Promise<T> {
  await client.query("begin");
  try {
    await client.query(`set local role ${role}`);
    if (uid) {
      await client.query(
        `set local request.jwt.claims = '{"sub":"${uid}","role":"${role}"}'`
      );
    }
    return await fn();
  } finally {
    await client.query("rollback");
  }
}

beforeAll(async () => {
  client = new Client({ connectionString: CONNECTION_STRING });
  await client.connect();
});

afterAll(async () => {
  await client.end();
});

describe("RLS guard queries (from 0002_rls_policies.sql Section 12)", () => {
  it("GUARD 1: every public table has RLS enabled", async () => {
    const res = await client.query(`
      select tablename
      from pg_tables
      where schemaname = 'public'
        and rowsecurity = false;
    `);
    expect(res.rows).toEqual([]);
  });

  it("GUARD 2: every SECURITY DEFINER function pins search_path", async () => {
    const res = await client.query(`
      select p.proname
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.prosecdef = true
        and not exists (
          select 1 from unnest(coalesce(p.proconfig, '{}')) cfg
          where cfg like 'search_path=%'
        );
    `);
    expect(res.rows).toEqual([]);
  });

  it("CHECK 3: the three gated views run with owner rights (security_invoker absent/false)", async () => {
    const res = await client.query(`
      select c.relname, c.reloptions
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'v'
        and c.relname in ('public_profiles', 'batch_members', 'course_outline_public');
    `);
    expect(res.rows).toHaveLength(3);
    for (const row of res.rows) {
      const opts: string[] = row.reloptions ?? [];
      const invokerOpt = opts.find((o: string) => o.startsWith("security_invoker="));
      expect(invokerOpt === undefined || invokerOpt === "security_invoker=false").toBe(
        true
      );
    }
  });

  it("CHECK 4: authenticated cannot write privileged profile columns", async () => {
    const res = await client.query(`
      select column_name
      from information_schema.column_privileges
      where table_name = 'profiles'
        and grantee = 'authenticated'
        and privilege_type = 'UPDATE';
    `);
    const columns = res.rows.map((r) => r.column_name);
    expect(columns).not.toContain("role");
    expect(columns).not.toContain("is_banned");
    expect(columns).not.toContain("ban_reason");
    expect(columns).not.toContain("admin_notes");
  });

  it("CHECK 5: only bkash_tokens and coupons are RLS-on-but-zero-policies (intentional deny-all)", async () => {
    const res = await client.query(`
      select t.tablename
      from pg_tables t
      where t.schemaname = 'public'
        and t.rowsecurity = true
        and not exists (
          select 1 from pg_policies p
          where p.schemaname = 'public' and p.tablename = t.tablename
        );
    `);
    const tables = res.rows.map((r) => r.tablename).sort();
    expect(tables).toEqual(["bkash_tokens", "coupons"]);
  });
});

describe("manual penetration checks (as an unenrolled, unpaid authenticated user)", () => {
  const FAKE_UID = "99999999-9999-9999-9999-999999999999";

  it("cannot select a non-preview lesson's bunny_video_id", async () => {
    await runAsRole(FAKE_UID, "authenticated", async () => {
      // Seed data's non-preview lessons (mindset, islampur-sourcing, etc.)
      // must be invisible entirely — RLS requires has_course_access OR
      // is_preview for a lesson row to be selectable at all.
      const res = await client.query(
        `select bunny_video_id from lessons where slug = 'mindset';`
      );
      expect(res.rows).toEqual([]);
    });
  });

  it("cannot read the community directory without an active enrollment", async () => {
    await runAsRole(FAKE_UID, "authenticated", async () => {
      const res = await client.query(`select * from public_profiles;`);
      expect(res.rows).toEqual([]);
    });
  });

  it("cannot read batch_private_links", async () => {
    await runAsRole(FAKE_UID, "authenticated", async () => {
      const res = await client.query(`select * from batch_private_links;`);
      expect(res.rows).toEqual([]);
    });
  });

  it("cannot read bkash_tokens under any circumstances", async () => {
    await runAsRole(FAKE_UID, "authenticated", async () => {
      await expect(client.query(`select * from bkash_tokens;`)).rejects.toThrow();
    });
  });

  it("cannot read coupons", async () => {
    await runAsRole(FAKE_UID, "authenticated", async () => {
      await expect(client.query(`select * from coupons;`)).rejects.toThrow();
    });
  });

  it("cannot insert their own enrollment", async () => {
    await runAsRole(FAKE_UID, "authenticated", async () => {
      await expect(
        client.query(
          `insert into enrollments (user_id, course_id) values ('${FAKE_UID}', (select id from courses limit 1));`
        )
      ).rejects.toThrow();
    });
  });

  it("cannot read another user's payments", async () => {
    await runAsRole(FAKE_UID, "authenticated", async () => {
      const res = await client.query(
        `select * from payments where user_id <> '${FAKE_UID}';`
      );
      expect(res.rows).toEqual([]);
    });
  });

  it("cannot read another user's profile row directly (phone/email unreachable)", async () => {
    await runAsRole(FAKE_UID, "authenticated", async () => {
      const res = await client.query(
        `select phone, email from profiles where id <> '${FAKE_UID}';`
      );
      expect(res.rows).toEqual([]);
    });
  });

  it("cannot read a zoom_join_url from live_sessions", async () => {
    await runAsRole(FAKE_UID, "authenticated", async () => {
      const res = await client.query(`select zoom_join_url from live_sessions;`);
      expect(res.rows).toEqual([]);
    });
  });
});
