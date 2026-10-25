
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Trade from "../src/models/Trade.js";

describe("Trade model", () => {
  const validTrade = () => ({
    symbol: "aapl",
    buyOrderId: new mongoose.Types.ObjectId(),
    sellOrderId: new mongoose.Types.ObjectId(),
    buyerId: new mongoose.Types.ObjectId(),
    sellerId: new mongoose.Types.ObjectId(),
    priceCents: 15000,
    quantity: 5,
  });

  it("creates a valid trade", () => {
    const trade = new Trade(validTrade());

    expect(trade.symbol).toBe("AAPL");
    expect(trade.priceCents).toBe(15000);
    expect(trade.quantity).toBe(5);
    expect(trade.executedAt).toBeInstanceOf(Date);
  });

  it("rejects a fractional trade price", async () => {
    const trade = new Trade({
      ...validTrade(),
      priceCents: 15000.5,
    });

    await expect(trade.validate()).rejects.toThrow();
  });

  it("rejects a fractional trade quantity", async () => {
    const trade = new Trade({
      ...validTrade(),
      quantity: 2.5,
    });

    await expect(trade.validate()).rejects.toThrow();
  });

  it("rejects a missing buyer ID", async () => {
    const data = validTrade();
    delete data.buyerId;

    const trade = new Trade(data);

    await expect(trade.validate()).rejects.toThrow();
  });

  it("rejects a zero trade price", async () => {
    const trade = new Trade({
      ...validTrade(),
      priceCents: 0,
    });

    await expect(trade.validate()).rejects.toThrow();
  });
});
