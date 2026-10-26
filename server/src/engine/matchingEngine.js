
const isValidOrder = (order) =>
  order &&
  typeof order.id === "string" &&
  typeof order.userId === "string" &&
  typeof order.symbol === "string" &&
  (order.side === "buy" || order.side === "sell") &&
  Number.isSafeInteger(order.priceCents) &&
  order.priceCents > 0 &&
  Number.isSafeInteger(order.remainingQuantity) &&
  order.remainingQuantity > 0 &&
  Number.isSafeInteger(order.acceptedSequence) &&
  order.acceptedSequence >= 0;

export const canOrdersMatch = (buyOrder, sellOrder) => {
  if (!isValidOrder(buyOrder) || !isValidOrder(sellOrder)) {
    return false;
  }

  if (buyOrder.side !== "buy" || sellOrder.side !== "sell") {
    return false;
  }

  if (buyOrder.symbol !== sellOrder.symbol) {
    return false;
  }

  if (buyOrder.userId === sellOrder.userId) {
    return false;
  }

  return buyOrder.priceCents >= sellOrder.priceCents;
};

export const calculateFill = (buyOrder, sellOrder) => {
  if (!canOrdersMatch(buyOrder, sellOrder)) {
    return null;
  }

  const quantity = Math.min(
    buyOrder.remainingQuantity,
    sellOrder.remainingQuantity
  );

  // The older order is resting in the order book.
  const restingOrder =
    buyOrder.acceptedSequence < sellOrder.acceptedSequence
      ? buyOrder
      : sellOrder;

  return {
    symbol: buyOrder.symbol,
    priceCents: restingOrder.priceCents,
    quantity,
    buyOrderId: buyOrder.id,
    sellOrderId: sellOrder.id,
    buyerId: buyOrder.userId,
    sellerId: sellOrder.userId,
  };
};
