
import { describe, it, expect } from "vitest";
import { OrderBook } from "../src/engine/orderBook.js";
import { MatchingCoordinator } from "../src/engine/matchingCoordinator.js";

const makeOrder = (overrides = {}) => ({
  id: "order-1",
  userId: "user-1",
  symbol: "AAPL",
  side: "buy",
  priceCents: 15000,
  remainingQuantity: 10,
  ...overrides,
});

const createCoordinator = () => {
  const book = new OrderBook("AAPL");
  const coordinator = new MatchingCoordinator(book);

  return { book, coordinator };
};

describe("MatchingCoordinator", () => {
  it("fills an order when the prices cross", () => {
    const { book, coordinator } = createCoordinator();

    book.addOrder(
      makeOrder({
        id: "sell-1",
        userId: "user-2",
        side: "sell",
        priceCents: 14900,
        remainingQuantity: 5,
      })
    );

    const result = coordinator.processLimitOrder(
      makeOrder({
        id: "buy-1",
        userId: "user-1",
        side: "buy",
        priceCents: 15000,
        remainingQuantity: 5,
      })
    );

    expect(result.status).toBe("filled");
    expect(result.filledQuantity).toBe(5);
    expect(result.remainingQuantity).toBe(0);
    expect(result.cancelledQuantity).toBe(0);
    expect(result.selfTradePrevented).toBe(false);
    expect(result.rested).toBe(false);
    expect(result.fills).toHaveLength(1);
    expect(result.fills[0].priceCents).toBe(14900);
    expect(book.getBestAsk()).toBeNull();
  });

  it("matches multiple resting orders in price priority", () => {
    const { book, coordinator } = createCoordinator();

    book.addOrder(
      makeOrder({
        id: "sell-2",
        userId: "user-2",
        side: "sell",
        priceCents: 15000,
        remainingQuantity: 6,
      })
    );

    book.addOrder(
      makeOrder({
        id: "sell-1",
        userId: "user-3",
        side: "sell",
        priceCents: 14900,
        remainingQuantity: 4,
      })
    );

    const result = coordinator.processLimitOrder(
      makeOrder({
        id: "buy-1",
        userId: "user-1",
        side: "buy",
        priceCents: 15000,
        remainingQuantity: 10,
      })
    );

    expect(result.status).toBe("filled");
    expect(result.filledQuantity).toBe(10);
    expect(result.remainingQuantity).toBe(0);
    expect(result.fills).toHaveLength(2);
    expect(result.fills.map((fill) => fill.quantity)).toEqual([4, 6]);
    expect(result.fills.map((fill) => fill.priceCents)).toEqual([
      14900,
      15000,
    ]);
    expect(book.getBestAsk()).toBeNull();
  });

  it("keeps the unfilled remainder of a limit order", () => {
    const { book, coordinator } = createCoordinator();

    book.addOrder(
      makeOrder({
        id: "sell-1",
        userId: "user-2",
        side: "sell",
        priceCents: 14900,
        remainingQuantity: 4,
      })
    );

    const result = coordinator.processLimitOrder(
      makeOrder({
        id: "buy-1",
        userId: "user-1",
        side: "buy",
        priceCents: 15000,
        remainingQuantity: 10,
      })
    );

    expect(result.status).toBe("partially_filled");
    expect(result.filledQuantity).toBe(4);
    expect(result.remainingQuantity).toBe(6);
    expect(result.cancelledQuantity).toBe(0);
    expect(result.selfTradePrevented).toBe(false);
    expect(result.rested).toBe(true);
    expect(book.getBestBid().id).toBe("buy-1");
    expect(book.getBestBid().remainingQuantity).toBe(6);
    expect(book.getBestAsk()).toBeNull();
  });

  it("does not execute when prices do not cross", () => {
    const { book, coordinator } = createCoordinator();

    book.addOrder(
      makeOrder({
        id: "sell-1",
        userId: "user-2",
        side: "sell",
        priceCents: 15100,
        remainingQuantity: 5,
      })
    );

    const result = coordinator.processLimitOrder(
      makeOrder({
        id: "buy-1",
        userId: "user-1",
        side: "buy",
        priceCents: 15000,
        remainingQuantity: 5,
      })
    );

    expect(result.status).toBe("open");
    expect(result.filledQuantity).toBe(0);
    expect(result.remainingQuantity).toBe(5);
    expect(result.rested).toBe(true);
    expect(book.getBestBid().id).toBe("buy-1");
    expect(book.getBestAsk().id).toBe("sell-1");
  });

  it("rejects a self-trading order without creating a crossed book", () => {
    const { book, coordinator } = createCoordinator();

    book.addOrder(
      makeOrder({
        id: "own-sell",
        userId: "user-1",
        side: "sell",
        priceCents: 14900,
        remainingQuantity: 5,
      })
    );

    book.addOrder(
      makeOrder({
        id: "other-sell",
        userId: "user-2",
        side: "sell",
        priceCents: 14950,
        remainingQuantity: 5,
      })
    );

    const result = coordinator.processLimitOrder(
      makeOrder({
        id: "buy-1",
        userId: "user-1",
        side: "buy",
        priceCents: 15000,
        remainingQuantity: 5,
      })
    );

    expect(result.status).toBe("rejected");
    expect(result.filledQuantity).toBe(0);
    expect(result.remainingQuantity).toBe(5);
    expect(result.cancelledQuantity).toBe(5);
    expect(result.selfTradePrevented).toBe(true);
    expect(result.rested).toBe(false);
    expect(result.fills).toHaveLength(0);

    expect(book.getBestAsk().id).toBe("own-sell");
    expect(book.getBestBid()).toBeNull();
  });

  it("preserves earlier fills and cancels the remainder at a self-trade conflict", () => {
    const { book, coordinator } = createCoordinator();

    book.addOrder(
      makeOrder({
        id: "other-sell",
        userId: "user-2",
        side: "sell",
        priceCents: 14900,
        remainingQuantity: 3,
      })
    );

    book.addOrder(
      makeOrder({
        id: "own-sell",
        userId: "user-1",
        side: "sell",
        priceCents: 14950,
        remainingQuantity: 5,
      })
    );

    const result = coordinator.processLimitOrder(
      makeOrder({
        id: "buy-1",
        userId: "user-1",
        side: "buy",
        priceCents: 15000,
        remainingQuantity: 5,
      })
    );

    expect(result.status).toBe("cancelled");
    expect(result.filledQuantity).toBe(3);
    expect(result.remainingQuantity).toBe(2);
    expect(result.cancelledQuantity).toBe(2);
    expect(result.selfTradePrevented).toBe(true);
    expect(result.rested).toBe(false);
    expect(result.fills).toHaveLength(1);
    expect(result.fills[0].quantity).toBe(3);

    expect(book.getBestAsk().id).toBe("own-sell");
    expect(book.getBestAsk().remainingQuantity).toBe(5);
    expect(book.getBestBid()).toBeNull();
  });

  it("rejects a duplicate order ID", () => {
    const { book, coordinator } = createCoordinator();

    book.addOrder(makeOrder({ id: "duplicate" }));

    expect(() =>
      coordinator.processLimitOrder(
        makeOrder({ id: "duplicate" })
      )
    ).toThrow("Duplicate order ID");
  });

  it("rejects invalid incoming order data", () => {
    const { coordinator } = createCoordinator();

    expect(() =>
      coordinator.processLimitOrder(
        makeOrder({ priceCents: 0 })
      )
    ).toThrow("Invalid incoming limit order");

    expect(() =>
      coordinator.processLimitOrder(
        makeOrder({ remainingQuantity: -1 })
      )
    ).toThrow("Invalid incoming limit order");
  });
});
