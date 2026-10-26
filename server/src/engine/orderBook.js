
const compareBuyOrders = (a, b) =>
  b.priceCents - a.priceCents ||
  a.acceptedSequence - b.acceptedSequence;

const compareSellOrders = (a, b) =>
  a.priceCents - b.priceCents ||
  a.acceptedSequence - b.acceptedSequence;

const isValidLimitOrder = (order) =>
  order &&
  typeof order.id === "string" &&
  order.id.length > 0 &&
  typeof order.userId === "string" &&
  order.userId.length > 0 &&
  typeof order.symbol === "string" &&
  (order.side === "buy" || order.side === "sell") &&
  Number.isSafeInteger(order.priceCents) &&
  order.priceCents > 0 &&
  Number.isSafeInteger(order.remainingQuantity) &&
  order.remainingQuantity > 0;

export class OrderBook {
  constructor(symbol) {
    if (
      typeof symbol !== "string" ||
      !/^[A-Z0-9.]{1,10}$/i.test(symbol)
    ) {
      throw new Error("A valid stock symbol is required");
    }

    this.symbol = symbol.toUpperCase();
    this.buyOrders = [];
    this.sellOrders = [];
    this.nextSequence = 1;
  }

  hasOrder(orderId) {
    return [...this.buyOrders, ...this.sellOrders].some(
      (order) => order.id === orderId
    );
  }


   
prepareOrder(order) {
  if (!isValidLimitOrder(order)) {
    throw new Error("Invalid limit order");
  }

  if (order.symbol.toUpperCase() !== this.symbol) {
    throw new Error("Order symbol does not match this order book");
  }

    if (this.hasOrder(order.id)) {
      throw new Error("Duplicate order ID");
    }

    const acceptedSequence = this.nextSequence;

    if (!Number.isSafeInteger(acceptedSequence)) {
      throw new Error("Order sequence limit reached");
    }

    this.nextSequence += 1;

    return {
      ...order,
      symbol: this.symbol,
      acceptedSequence,
    };
  }

  addAcceptedOrder(order) {
    if (
      !isValidLimitOrder(order) ||
      order.symbol !== this.symbol ||
      !Number.isSafeInteger(order.acceptedSequence) ||
      order.acceptedSequence < 1
    ) {
      throw new Error("Invalid accepted order");
    }

    if (this.hasOrder(order.id)) {
      throw new Error("Duplicate order ID");
    }

    const storedOrder = { ...order };
    const orders =
      storedOrder.side === "buy" ? this.buyOrders : this.sellOrders;

    orders.push(storedOrder);
    orders.sort(
      storedOrder.side === "buy"
        ? compareBuyOrders
        : compareSellOrders
    );

    return { ...storedOrder };
  }

  addOrder(order) {
    const acceptedOrder = this.prepareOrder(order);
    return this.addAcceptedOrder(acceptedOrder);
  }

  updateRemainingQuantity(orderId, remainingQuantity) {
    if (
      !Number.isSafeInteger(remainingQuantity) ||
      remainingQuantity < 0
    ) {
      throw new Error("Remaining quantity must be a non-negative integer");
    }

    for (const orders of [this.buyOrders, this.sellOrders]) {
      const order = orders.find((item) => item.id === orderId);

      if (order) {
        if (remainingQuantity === 0) {
          this.removeOrder(orderId);
          return null;
        }

        order.remainingQuantity = remainingQuantity;
        return { ...order };
      }
    }

    return null;
  }

  removeOrder(orderId) {
    for (const orders of [this.buyOrders, this.sellOrders]) {
      const index = orders.findIndex((order) => order.id === orderId);

      if (index !== -1) {
        const [removed] = orders.splice(index, 1);
        return { ...removed };
      }
    }

    return null;
  }

  getBestBid() {
    return this.buyOrders.length
      ? { ...this.buyOrders[0] }
      : null;
  }

  getBestAsk() {
    return this.sellOrders.length
      ? { ...this.sellOrders[0] }
      : null;
  }

  getOrders() {
    return {
      buys: this.buyOrders.map((order) => ({ ...order })),
      sells: this.sellOrders.map((order) => ({ ...order })),
    };
  }

  cancelOrder(orderId, userId) {
    for (const orders of [this.buyOrders, this.sellOrders]) {
      const index = orders.findIndex(
        (order) => order.id === orderId && order.userId === userId
      );

      if (index !== -1) {
        const [cancelledOrder] = orders.splice(index, 1);
        return { ...cancelledOrder };
      }
    }

    return null;
  }
}
