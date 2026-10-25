
import { describe, it, expect } from "vitest";
import {
  dollarsToCents,
  centsToDollars,
  formatCents,
} from "../src/utils/money.js";

describe("Money utilities", () => {
  it("converts dollars to cents", () => {
    expect(dollarsToCents(150.25)).toBe(15025);
  });

  it("converts cents to dollars", () => {
    expect(centsToDollars(15025)).toBe(150.25);
  });

  it("formats cents as USD currency", () => {
    expect(formatCents(15025)).toBe("$150.25");
  });

  it("handles floating-point rounding when converting dollars", () => {
    expect(dollarsToCents(0.1 + 0.2)).toBe(30);
  });

  it("rejects non-finite dollar amounts", () => {
    expect(() => dollarsToCents(Infinity)).toThrow();
  });

  it("rejects fractional cents", () => {
    expect(() => centsToDollars(150.5)).toThrow();
  });

  it("rejects unsafe integer amounts", () => {
    expect(() => formatCents(Number.MAX_SAFE_INTEGER + 1)).toThrow();
  });
});
