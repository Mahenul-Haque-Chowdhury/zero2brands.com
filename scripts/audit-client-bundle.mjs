#!/usr/bin/env node
/**
 * Phase 14.4: audit the client bundle before launch. Greps the built
 * .next/static output for server secret names — any match is a total
 * compromise. Run after `npm run build`.
 *
 * Usage: node scripts/audit-client-bundle.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const STATIC_DIR = join(process.cwd(), ".next", "static");

const FORBIDDEN_NAMES = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "BUNNY_STREAM_TOKEN_KEY",
  "BUNNY_STREAM_API_KEY",
  "BUNNY_ACCOUNT_API_KEY",
  "BKASH_APP_SECRET",
  "BKASH_PASSWORD",
  "BKASH_USERNAME",
  "META_CAPI_ACCESS_TOKEN",
  "SMS_API_KEY",
  "RESEND_API_KEY",
  "CRON_SECRET",
  "SENTRY_AUTH_TOKEN",
  "UPSTASH_REDIS_REST_TOKEN",
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  let files;
  try {
    files = walk(STATIC_DIR);
  } catch {
    console.error(
      `Could not read ${STATIC_DIR}. Run "npm run build" first.`
    );
    process.exit(1);
  }

  const hits = [];

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const name of FORBIDDEN_NAMES) {
      if (content.includes(name)) {
        hits.push({ file, name });
      }
    }
  }

  if (hits.length > 0) {
    console.error("CLIENT BUNDLE SECRET AUDIT FAILED:");
    for (const hit of hits) {
      console.error(`  ${hit.name} found in ${hit.file}`);
    }
    process.exit(1);
  }

  console.log(
    `Client bundle secret audit passed: ${files.length} files checked, no matches for ${FORBIDDEN_NAMES.length} forbidden names.`
  );
}

main();
