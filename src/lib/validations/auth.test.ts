import { describe, it, expect } from "vitest";
import { normalizeBdPhone } from "./auth";

describe("normalizeBdPhone", () => {
  it("accepts a bare 01X number", () => {
    expect(normalizeBdPhone("01712345678")).toBe("01712345678");
  });

  it("strips the +88 prefix", () => {
    expect(normalizeBdPhone("+8801712345678")).toBe("01712345678");
  });

  it("strips the 88 prefix without plus", () => {
    expect(normalizeBdPhone("8801712345678")).toBe("01712345678");
  });

  it("strips spaces and dashes", () => {
    expect(normalizeBdPhone("017-1234-5678")).toBe("01712345678");
  });

  it("rejects an invalid operator digit", () => {
    expect(normalizeBdPhone("01212345678")).toBeNull();
  });

  it("rejects a too-short number", () => {
    expect(normalizeBdPhone("0171234567")).toBeNull();
  });

  it("rejects a non-Bangladeshi number", () => {
    expect(normalizeBdPhone("+14155552671")).toBeNull();
  });
});
