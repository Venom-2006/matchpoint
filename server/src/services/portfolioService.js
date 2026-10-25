
import Portfolio from "../models/Portfolio.js";
import Stock from "../models/Stock.js";

export const getUserPortfolio = async (userId) => {
  const holdings = await Portfolio.find({ userId })
    .select("symbol quantity totalCostBasisCents updatedAt")
    .sort({ symbol: 1 })
    .lean();

  if (holdings.length === 0) {
    return [];
  }

  const symbols = holdings.map((holding) => holding.symbol);

  const stocks = await Stock.find({
    symbol: { $in: symbols },
  })
    .select("symbol name")
    .lean();

  const stockNames = new Map(
    stocks.map((stock) => [stock.symbol, stock.name])
  );

  return holdings.map((holding) => ({
    symbol: holding.symbol,
    name: stockNames.get(holding.symbol) ?? holding.symbol,
    quantity: holding.quantity,
    totalCostBasisCents: holding.totalCostBasisCents,
    averageCostCents:
      holding.quantity > 0
        ? holding.totalCostBasisCents / holding.quantity
        : null,
    updatedAt: holding.updatedAt,
  }));
};
