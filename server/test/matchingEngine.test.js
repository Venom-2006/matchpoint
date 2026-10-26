
import { describe, it, expect } from "vitest";
import {
  canOrdersMatch,
  calculateFill,
} from "../src/engine/matchingEngine.js";

const createOrder = (overrides = {}) => ({
  id: "order-1",
  userId: "user-1",
  symbol: "AAPL",
  side: "buy",
  priceCents: 15000,
  remainingQuantity: 10,
  acceptedSequence: 1,
  ...overrides,
});

describe("canOrdersMatch", () => {
  it("matches crossing buy and sell prices", () => {
    const buy = createOrder({ priceCents: 15000 });
    const sell = createOrder({
      id: "order-2",
      userId: "user-2",
      side: "sell",
      priceCents: 14900,
      acceptedSequence: 2,
    });

    expect(canOrdersMatch(buy, sell)).toBe(true);
  });

  it("does not match when prices do not cross", () => {
    const buy = createOrder({ priceCents: 14800 });
    const sell = createOrder({
      id: "order-2",
      userId: "user-2",
      side: "sell",
      priceCents: 14900,
      acceptedSequence: 2,
    });

    expect(canOrdersMatch(buy, sell)).toBe(false);
  });

  it("does not match orders for different symbols", () => {
    const buy = createOrder();
    const sell = createOrder({
      id: "order-2",
      userId: "user-2",
      side: "sell",
      symbol: "MSFT",
      priceCents: 14000,
      acceptedSequence: 2,
    });

    expect(canOrdersMatch(buy, sell)).toBe(false);
  });

  it("prevents self-trading", () => {
    const buy = createOrder();
    const sell = createOrder({
      id: "order-2",
      side: "sell",
      priceCents: 14000,
      acceptedSequence: 2,
    });

    expect(canOrdersMatch(buy, sell)).toBe(false);
  });
});

describe("calculateFill", () => {
  it("calculates a partial fill at the resting order price", () => {
    const buy = createOrder({
      priceCents: 15000,
      remainingQuantity: 10,
      acceptedSequence: 2,
    });

    const sell = createOrder({
      id: "order-2",
      userId: "user-2",
      side: "sell",
      priceCents: 14900,
      remainingQuantity: 6,
      acceptedSequence: 1,
    });

    expect(calculateFill(buy, sell)).toEqual({
      symbol: "AAPL",
      priceCents: 14900,
      quantity: 6,
      buyOrderId: "order-1",
      sellOrderId: "order-2",
      buyerId: "user-1",
      sellerId: "user-2",
    });
  });

  it("returns null when orders cannot match", () => {
    const buy = createOrder({ priceCents: 14800 });
    const sell = createOrder({
      id: "order-2",
      userId: "user-2",
      side: "sell",
      priceCents: 14900,
      acceptedSequence: 2,
    });

    expect(calculateFill(buy, sell)).toBeNull();
  });
});
