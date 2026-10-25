
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/models/Stock.js", () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock("../src/models/MarketState.js", () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
  },
}));

import Stock from "../src/models/Stock.js";
import MarketState from "../src/models/MarketState.js";
import {
  getAllMarketData,
  getMarketDataForSymbol,
} from "../src/services/marketDataService.js";

const makeQuery = (result) => ({
  select: vi.fn().mockReturnThis(),
  sort: vi.fn().mockReturnThis(),
  lean: vi.fn().mockResolvedValue(result),
});

describe("Market data service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active stocks with their market data", async () => {
    Stock.find.mockReturnValue(
      makeQuery([
        { symbol: "AAPL", name: "Apple Inc.", priceDecimals: 2 },
      ])
    );

    MarketState.find.mockReturnValue(
      makeQuery([
        {
          symbol: "AAPL",
          lastPriceCents: 15000,
          bestBidCents: 14990,
          bestAskCents: 15010,
          volume: 25,
          lastTradeAt: new Date("2026-01-01T10:00:00Z"),
        },
      ])
    );

    const result = await getAllMarketData();

    expect(result).toHaveLength(1);
    expect(result[0].symbol).toBe("AAPL");
    expect(result[0].lastPriceCents).toBe(15000);
    expect(result[0].bestBidCents).toBe(14990);
    expect(result[0].bestAskCents).toBe(15010);
    expect(result[0].volume).toBe(25);
  });

  it("uses empty market defaults when no snapshot exists", async () => {
    Stock.find.mockReturnValue(
      makeQuery([
        { symbol: "MSFT", name: "Microsoft", priceDecimals: 2 },
      ])
    );

    MarketState.find.mockReturnValue(makeQuery([]));

    const result = await getAllMarketData();

    expect(result[0].lastPriceCents).toBeNull();
    expect(result[0].bestBidCents).toBeNull();
    expect(result[0].bestAskCents).toBeNull();
    expect(result[0].volume).toBe(0);
  });

  it("returns data for a valid stock symbol", async () => {
    Stock.findOne.mockReturnValue(
      makeQuery({
        symbol: "AAPL",
        name: "Apple Inc.",
        priceDecimals: 2,
      })
    );

    MarketState.findOne.mockReturnValue(
      makeQuery({
        symbol: "AAPL",
        lastPriceCents: 15000,
        bestBidCents: 14990,
        bestAskCents: 15010,
        volume: 25,
        lastTradeAt: null,
      })
    );

    const result = await getMarketDataForSymbol("aapl");

    expect(Stock.findOne).toHaveBeenCalledWith({
      symbol: "AAPL",
      isActive: true,
    });
    expect(result.symbol).toBe("AAPL");
    expect(result.lastPriceCents).toBe(15000);
  });

  it("rejects an invalid stock symbol", async () => {
    await expect(
      getMarketDataForSymbol("AAPL!")
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(Stock.findOne).not.toHaveBeenCalled();
  });

  it("returns 404 when the stock does not exist", async () => {
    Stock.findOne.mockReturnValue(makeQuery(null));

    await expect(
      getMarketDataForSymbol("ZZZZ")
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
