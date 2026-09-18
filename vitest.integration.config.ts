import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Separate config for RLS/integration tests that need a live local
 * Supabase Postgres connection (via `supabase start`). Run with
 * `npm run test:integration` — these are NOT part of the default `npm
 * run test` unit-test run, since they require Docker and a running
 * database, and CI should run them as an explicit separate step after
 * `supabase start`.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
