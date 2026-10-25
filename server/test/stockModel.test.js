
import { describe, it, expect } from "vitest";
import Stock from "../src/models/Stock.js";

describe("Stock model", () => {
  it("creates a valid stock object", () => {
    const stock = new Stock({
      symbol: "AAPL",
      name: "Apple Inc.",
    });

    expect(stock.symbol).toBe("AAPL");
    expect(stock.name).toBe("Apple Inc.");
    expect(stock.isActive).toBe(true);
    expect(stock.priceDecimals).toBe(2);
  });

  it("normalizes the stock symbol to uppercase", () => {
    const stock = new Stock({
      symbol: "aapl",
      name: "Apple Inc.",
    });

    expect(stock.symbol).toBe("AAPL");
  });

  it("rejects an invalid stock symbol", async () => {
    const stock = new Stock({
      symbol: "APPLE STOCK!",
      name: "Apple Inc.",
    });

    await expect(stock.validate()).rejects.toThrow();
  });

  it("rejects a missing stock name", async () => {
    const stock = new Stock({
      symbol: "AAPL",
    });

    await expect(stock.validate()).rejects.toThrow();
  });
});
