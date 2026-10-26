
import { describe, it, expect } from "vitest";
import { OrderBook } from "../src/engine/orderBook.js";

const makeOrder = (overrides = {}) => ({
  id: "order-1",
  userId: "user-1",
  symbol: "AAPL",
  side: "buy",
  priceCents: 15000,
  remainingQuantity: 10,
  ...overrides,
});

describe("OrderBook", () => {
  it("prioritizes the highest buy price", () => {
    const book = new OrderBook("AAPL");

    book.addOrder(makeOrder({ id: "low", priceCents: 14000 }));
    book.addOrder(makeOrder({ id: "high", priceCents: 16000 }));

    expect(book.getBestBid().id).toBe("high");
  });

  it("prioritizes the lowest sell price", () => {
    const book = new OrderBook("AAPL");

    book.addOrder(
      makeOrder({
        id: "high-ask",
        side: "sell",
        priceCents: 16000,
      })
    );

    book.addOrder(
      makeOrder({
        id: "low-ask",
        side: "sell",
        priceCents: 14000,
      })
    );

    expect(book.getBestAsk().id).toBe("low-ask");
  });

  it("preserves acceptance order at equal prices", () => {
    const book = new OrderBook("AAPL");

    book.addOrder(makeOrder({ id: "first", priceCents: 15000 }));
    book.addOrder(makeOrder({ id: "second", priceCents: 15000 }));

    expect(book.getBestBid().id).toBe("first");
  });

  it("does not accept duplicate order IDs", () => {
    const book = new OrderBook("AAPL");

    book.addOrder(makeOrder());

    expect(() => book.addOrder(makeOrder())).toThrow(
      "Duplicate order ID"
    );
  });

  it("does not accept orders for a different symbol", () => {
    const book = new OrderBook("AAPL");

    expect(() =>
      book.addOrder(makeOrder({ symbol: "MSFT" }))
    ).toThrow("Order symbol does not match this order book");
  });

  it("allows only the order owner to cancel an order", () => {
    const book = new OrderBook("AAPL");
    book.addOrder(makeOrder());

    expect(book.cancelOrder("order-1", "user-2")).toBeNull();
    expect(book.cancelOrder("order-1", "user-1").id).toBe("order-1");
    expect(book.getBestBid()).toBeNull();
  });
});


describe("OrderBook edge cases", () => {
  it("removes a fully filled order when its remaining quantity reaches zero", async () => {
    const { OrderBook } = await import("../src/engine/orderBook.js");
    const book = new OrderBook("AAPL");

    book.addOrder({
      id: "buy-1",
      userId: "user-1",
      symbol: "AAPL",
      side: "buy",
      priceCents: 15000,
      remainingQuantity: 10,
    });

    const updated = book.updateRemainingQuantity("buy-1", 0);

    expect(updated).toBeNull();
    expect(book.getBestBid()).toBeNull();
  });

  it("updates the best bid when the highest-priced buy order is removed", async () => {
    const { OrderBook } = await import("../src/engine/orderBook.js");
    const book = new OrderBook("AAPL");

    book.addOrder({
      id: "buy-1",
      userId: "user-1",
      symbol: "AAPL",
      side: "buy",
      priceCents: 15000,
      remainingQuantity: 5,
    });

    book.addOrder({
      id: "buy-2",
      userId: "user-2",
      symbol: "AAPL",
      side: "buy",
      priceCents: 14900,
      remainingQuantity: 8,
    });

    book.removeOrder("buy-1");

    expect(book.getBestBid().id).toBe("buy-2");
    expect(book.getBestBid().priceCents).toBe(14900);
  });

  it("does not allow an invalid remaining quantity", async () => {
    const { OrderBook } = await import("../src/engine/orderBook.js");
    const book = new OrderBook("AAPL");

    book.addOrder({
      id: "buy-1",
      userId: "user-1",
      symbol: "AAPL",
      side: "buy",
      priceCents: 15000,
      remainingQuantity: 10,
    });

    expect(() => {
      book.updateRemainingQuantity("buy-1", -1);
    }).toThrow("Remaining quantity must be a non-negative integer");

    expect(book.getBestBid().remainingQuantity).toBe(10);
  });

  it("returns copies so callers cannot directly mutate stored orders", async () => {
    const { OrderBook } = await import("../src/engine/orderBook.js");
    const book = new OrderBook("AAPL");

    book.addOrder({
      id: "buy-1",
      userId: "user-1",
      symbol: "AAPL",
      side: "buy",
      priceCents: 15000,
      remainingQuantity: 10,
    });

    const returnedOrder = book.getBestBid();
    returnedOrder.remainingQuantity = 999;

    expect(book.getBestBid().remainingQuantity).toBe(10);
  });
});
