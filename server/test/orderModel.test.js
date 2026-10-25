
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Order from "../src/models/Order.js";

describe("Order model", () => {
  it("creates a valid limit buy order", () => {
    const order = new Order({
      userId: new mongoose.Types.ObjectId(),
      symbol: "aapl",
      side: "buy",
      type: "limit",
      priceCents: 15000,
      quantity: 10,
    });

    expect(order.symbol).toBe("AAPL");
    expect(order.side).toBe("buy");
    expect(order.type).toBe("limit");
    expect(order.priceCents).toBe(15000);
    expect(order.quantity).toBe(10);
    expect(order.filledQuantity).toBe(0);
    expect(order.status).toBe("pending");
  });

  it("rejects an invalid order side", async () => {
    const order = new Order({
      userId: new mongoose.Types.ObjectId(),
      symbol: "AAPL",
      side: "hold",
      type: "limit",
      priceCents: 15000,
      quantity: 10,
    });

    await expect(order.validate()).rejects.toThrow();
  });

  it("rejects a fractional price in cents", async () => {
    const order = new Order({
      userId: new mongoose.Types.ObjectId(),
      symbol: "AAPL",
      side: "buy",
      type: "limit",
      priceCents: 15000.5,
      quantity: 10,
    });

    await expect(order.validate()).rejects.toThrow();
  });

  it("rejects a fractional quantity", async () => {
    const order = new Order({
      userId: new mongoose.Types.ObjectId(),
      symbol: "AAPL",
      side: "buy",
      type: "limit",
      priceCents: 15000,
      quantity: 1.5,
    });

    await expect(order.validate()).rejects.toThrow();
  });

  it("rejects a missing user ID", async () => {
    const order = new Order({
      symbol: "AAPL",
      side: "buy",
      type: "limit",
      priceCents: 15000,
      quantity: 10,
    });

    await expect(order.validate()).rejects.toThrow();
  });
});
