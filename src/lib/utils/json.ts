import type { Json } from "@/types/database";

/**
 * Round-trips an arbitrary serializable value into the `Json` type Supabase
 * expects for jsonb columns. Safe for any plain object (like a bKash API
 * response) that already survives JSON.stringify — used whenever we store
 * a typed external API response into a jsonb column.
 */
export function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}
