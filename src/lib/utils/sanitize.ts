import "server-only";
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes HTML on WRITE, server-side, strict allowlist. Never sanitize
 * only on render — an admin-authored lesson body or a student bio that
 * gets stored unsanitized is an XSS vector that runs inside every viewer's
 * authenticated session (Phase 5.6 / 14.3 of the build plan).
 */
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "blockquote", "code", "pre", "img",
  "table", "thead", "tbody", "tr", "th", "td", "hr", "span",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "target", "rel"];

export function sanitizeLessonHtml(rawHtml: string): string {
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/** Stricter allowlist for short user-authored text (bios, notes). */
export function sanitizePlainRichText(rawHtml: string): string {
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href"],
    ALLOW_DATA_ATTR: false,
  });
}
