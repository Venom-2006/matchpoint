
import { describe, it, expect } from "vitest";
import MarketState from "../src/models/MarketState.js";

describe("MarketState model", () => {
  it("creates a valid market state", () => {
    const state = new MarketState({ symbol: "aapl" });

    expect(state.symbol).toBe("AAPL");
    expect(state.lastPriceCents).toBeNull();
    expect(state.bestBidCents).toBeNull();
    expect(state.bestAskCents).toBeNull();
    expect(state.volume).toBe(0);
    expect(state.lastTradeAt).toBeNull();
  });

  it("accepts valid market prices", async () => {
    const state = new MarketState({
      symbol: "MSFT",
      lastPriceCents: 42500,
      bestBidCents: 42490,
      bestAskCents: 42510,
      volume: 100,
    });

    await expect(state.validate()).resolves.toBeUndefined();
  });

  it("rejects a fractional last price", async () => {
    const state = new MarketState({
      symbol: "AAPL",
      lastPriceCents: 15000.5,
    });

    await expect(state.validate()).rejects.toThrow();
  });

  it("rejects a zero best bid", async () => {
    const state = new MarketState({
      symbol: "AAPL",
      bestBidCents: 0,
    });

    await expect(state.validate()).rejects.toThrow();
  });

  it("rejects a negative volume", async () => {
    const state = new MarketState({
      symbol: "AAPL",
      volume: -1,
    });

    await expect(state.validate()).rejects.toThrow();
  });
});
