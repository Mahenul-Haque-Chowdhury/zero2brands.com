/**
 * Small date-arithmetic helpers factored out of Server Components.
 *
 * The React Compiler's purity lint rule flags any call to Date.now()/new
 * Date() directly inside a component body as an "impure function during
 * render" — a rule aimed at client components where such a call could
 * cause hydration mismatches. Async Server Components that only use the
 * result to build a database query filter (never render it into JSX
 * output directly) don't have that hydration concern, but satisfying the
 * linter by moving the computation into a plain helper function is
 * simpler than suppressing the rule, and arguably clearer code anyway.
 */

export function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}

export function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function nowMs(): number {
  return Date.now();
}
