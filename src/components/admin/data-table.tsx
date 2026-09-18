import { cn } from "cn";
import { TableHead } from "@/components/ui/table";

/**
 * Shared chrome for the management tables.
 *
 * Every admin table repeated the same long uppercase-label class string on
 * each column and the same wrapper divs. Centralising them keeps the tables
 * visually identical and makes a future tweak one edit instead of twelve.
 */

/** Column header. `align="right"` for numeric columns. */
export function Th({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <TableHead
      className={cn(
        "h-9 text-xs font-medium uppercase tracking-wide text-muted-foreground",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </TableHead>
  );
}

/** Bordered surface every management table sits on. */
export function TableSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-card",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Consistent zero-row state, rendered inside a full-width cell. */
export function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <Icon className="size-8 text-muted-foreground/40" />
      <p className="text-sm font-medium">{title}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Page title block shared by every management screen. */
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-sans text-xl font-semibold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
