
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Portfolio from "../src/models/Portfolio.js";

describe("Portfolio model", () => {
  const validPortfolio = () => ({
    userId: new mongoose.Types.ObjectId(),
    symbol: "aapl",
    quantity: 10,
    totalCostBasisCents: 15000,
  });

  it("creates a valid portfolio holding", () => {
    const portfolio = new Portfolio(validPortfolio());

    expect(portfolio.symbol).toBe("AAPL");
    expect(portfolio.quantity).toBe(10);
    expect(portfolio.totalCostBasisCents).toBe(15000);
  });

  it("defaults quantity and total cost basis to zero", () => {
    const portfolio = new Portfolio({
      userId: new mongoose.Types.ObjectId(),
      symbol: "MSFT",
    });

    expect(portfolio.quantity).toBe(0);
    expect(portfolio.totalCostBasisCents).toBe(0);
  });

  it("rejects a fractional quantity", async () => {
    const portfolio = new Portfolio({
      ...validPortfolio(),
      quantity: 1.5,
    });

    await expect(portfolio.validate()).rejects.toThrow();
  });

  it("rejects a negative quantity", async () => {
    const portfolio = new Portfolio({
      ...validPortfolio(),
      quantity: -1,
    });

    await expect(portfolio.validate()).rejects.toThrow();
  });

  it("rejects a negative total cost basis", async () => {
    const portfolio = new Portfolio({
      ...validPortfolio(),
      totalCostBasisCents: -100,
    });

    await expect(portfolio.validate()).rejects.toThrow();
  });

  it("rejects a missing user ID", async () => {
    const portfolio = new Portfolio({
      symbol: "AAPL",
      quantity: 10,
      totalCostBasisCents: 15000,
    });

    await expect(portfolio.validate()).rejects.toThrow();
  });
});
