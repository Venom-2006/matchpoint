
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/models/Portfolio.js", () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock("../src/models/Stock.js", () => ({
  default: {
    find: vi.fn(),
  },
}));

import Portfolio from "../src/models/Portfolio.js";
import Stock from "../src/models/Stock.js";
import { getUserPortfolio } from "../src/services/portfolioService.js";

const makeQuery = (result) => ({
  select: vi.fn().mockReturnThis(),
  sort: vi.fn().mockReturnThis(),
  lean: vi.fn().mockResolvedValue(result),
});

describe("Portfolio service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns holdings with stock names and average cost", async () => {
    Portfolio.find.mockReturnValue(
      makeQuery([
        {
          symbol: "AAPL",
          quantity: 3,
          totalCostBasisCents: 3002,
          updatedAt: new Date("2026-01-01T10:00:00Z"),
        },
      ])
    );

    Stock.find.mockReturnValue(
      makeQuery([
        { symbol: "AAPL", name: "Apple Inc." },
      ])
    );

    const result = await getUserPortfolio("user-123");

    expect(result).toHaveLength(1);
    expect(result[0].symbol).toBe("AAPL");
    expect(result[0].name).toBe("Apple Inc.");
    expect(result[0].quantity).toBe(3);
    expect(result[0].totalCostBasisCents).toBe(3002);
    expect(result[0].averageCostCents).toBeCloseTo(3002 / 3);
  });

  it("returns an empty array when the user has no holdings", async () => {
    Portfolio.find.mockReturnValue(makeQuery([]));

    const result = await getUserPortfolio("user-123");

    expect(result).toEqual([]);
    expect(Stock.find).not.toHaveBeenCalled();
  });

  it("falls back to the symbol when a stock name is missing", async () => {
    Portfolio.find.mockReturnValue(
      makeQuery([
        {
          symbol: "XYZ",
          quantity: 2,
          totalCostBasisCents: 2000,
          updatedAt: null,
        },
      ])
    );

    Stock.find.mockReturnValue(makeQuery([]));

    const result = await getUserPortfolio("user-123");

    expect(result[0].name).toBe("XYZ");
  });

  it("returns null average cost for zero-quantity holdings", async () => {
    Portfolio.find.mockReturnValue(
      makeQuery([
        {
          symbol: "AAPL",
          quantity: 0,
          totalCostBasisCents: 0,
          updatedAt: null,
        },
      ])
    );

    Stock.find.mockReturnValue(
      makeQuery([
        { symbol: "AAPL", name: "Apple Inc." },
      ])
    );

    const result = await getUserPortfolio("user-123");

    expect(result[0].averageCostCents).toBeNull();
  });
});
