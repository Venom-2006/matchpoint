
import { canOrdersMatch, calculateFill } from "./matchingEngine.js";

export class MatchingCoordinator {
  constructor(orderBook) {
    if (
      !orderBook ||
      typeof orderBook.getBestBid !== "function" ||
      typeof orderBook.getBestAsk !== "function" ||
      typeof orderBook.prepareOrder !== "function" ||
      typeof orderBook.addAcceptedOrder !== "function" ||
      typeof orderBook.updateRemainingQuantity !== "function" ||
      typeof orderBook.hasOrder !== "function"
    ) {
      throw new Error("A compatible order book is required");
    }

    this.orderBook = orderBook;
  }

  processLimitOrder(incomingOrder) {
    if (
      !incomingOrder ||
      typeof incomingOrder.symbol !== "string" ||
      incomingOrder.symbol.toUpperCase() !== this.orderBook.symbol ||
      !["buy", "sell"].includes(incomingOrder.side) ||
      !Number.isSafeInteger(incomingOrder.priceCents) ||
      incomingOrder.priceCents <= 0 ||
      !Number.isSafeInteger(incomingOrder.remainingQuantity) ||
      incomingOrder.remainingQuantity <= 0 ||
      typeof incomingOrder.id !== "string" ||
      !incomingOrder.id ||
      typeof incomingOrder.userId !== "string" ||
      !incomingOrder.userId
    ) {
      throw new Error("Invalid incoming limit order");
    }

    if (this.orderBook.hasOrder(incomingOrder.id)) {
      throw new Error("Duplicate order ID");
    }

    const incoming = this.orderBook.prepareOrder(incomingOrder);
    const originalQuantity = incoming.remainingQuantity;
    const fills = [];
    let selfTradePrevented = false;

    while (incoming.remainingQuantity > 0) {
      const restingOrder =
        incoming.side === "buy"
          ? this.orderBook.getBestAsk()
          : this.orderBook.getBestBid();

      if (!restingOrder) {
        break;
      }

      const pricesCross =
        incoming.side === "buy"
          ? incoming.priceCents >= restingOrder.priceCents
          : incoming.priceCents <= restingOrder.priceCents;

      if (!pricesCross) {
        break;
      }

      // Never trade against the same user's order or skip past it.
      if (incoming.userId === restingOrder.userId) {
        selfTradePrevented = true;
        break;
      }

      const buyOrder =
        incoming.side === "buy" ? incoming : restingOrder;

      const sellOrder =
        incoming.side === "sell" ? incoming : restingOrder;

      if (!canOrdersMatch(buyOrder, sellOrder)) {
        throw new Error("Order book contains an invalid match candidate");
      }

      const fill = calculateFill(buyOrder, sellOrder);

      if (!fill) {
        throw new Error("Unable to calculate an eligible fill");
      }

      fills.push(fill);
      incoming.remainingQuantity -= fill.quantity;

      const restingRemaining =
        restingOrder.remainingQuantity - fill.quantity;

      this.orderBook.updateRemainingQuantity(
        restingOrder.id,
        restingRemaining
      );
    }

    const filledQuantity = fills.reduce(
      (total, fill) => total + fill.quantity,
      0
    );

    // A self-trade conflict cancels the unfilled remainder.
    // Otherwise, an ordinary limit-order remainder rests in the book.
    const shouldRest =
      incoming.remainingQuantity > 0 && !selfTradePrevented;

    if (shouldRest) {
      this.orderBook.addAcceptedOrder(incoming);
    }

    let status;

    if (incoming.remainingQuantity === 0) {
      status = "filled";
    } else if (selfTradePrevented && filledQuantity === 0) {
      status = "rejected";
    } else if (selfTradePrevented) {
      status = "cancelled";
    } else if (filledQuantity > 0) {
      status = "partially_filled";
    } else {
      status = "open";
    }

    return {
      orderId: incoming.id,
      symbol: incoming.symbol,
      side: incoming.side,
      originalQuantity,
      filledQuantity,
      remainingQuantity: incoming.remainingQuantity,
      cancelledQuantity: selfTradePrevented
        ? incoming.remainingQuantity
        : 0,
      selfTradePrevented,
      rested: shouldRest,
      status,
      fills,
    };
  }
}
