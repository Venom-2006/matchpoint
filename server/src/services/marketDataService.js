
import Stock from "../models/Stock.js";
import MarketState from "../models/MarketState.js";

export const getAllMarketData = async () => {
  const stocks = await Stock.find({ isActive: true })
    .select("symbol name priceDecimals")
    .sort({ symbol: 1 })
    .lean();

  const marketStates = await MarketState.find({
    symbol: { $in: stocks.map((stock) => stock.symbol) },
  })
    .select(
      "symbol lastPriceCents bestBidCents bestAskCents volume lastTradeAt"
    )
    .lean();

  const marketStateBySymbol = new Map(
    marketStates.map((state) => [state.symbol, state])
  );

  return stocks.map((stock) => {
    const state = marketStateBySymbol.get(stock.symbol);

    return {
      symbol: stock.symbol,
      name: stock.name,
      priceDecimals: stock.priceDecimals,
      lastPriceCents: state?.lastPriceCents ?? null,
      bestBidCents: state?.bestBidCents ?? null,
      bestAskCents: state?.bestAskCents ?? null,
      volume: state?.volume ?? 0,
      lastTradeAt: state?.lastTradeAt ?? null,
    };
  });
};

export const getMarketDataForSymbol = async (symbol) => {
  if (typeof symbol !== "string" || !/^[A-Z0-9.]{1,10}$/i.test(symbol.trim())) {
    const error = new Error("A valid stock symbol is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedSymbol = symbol.trim().toUpperCase();

  const stock = await Stock.findOne({
    symbol: normalizedSymbol,
    isActive: true,
  })
    .select("symbol name priceDecimals")
    .lean();

  if (!stock) {
    const error = new Error("Stock not found");
    error.statusCode = 404;
    throw error;
  }

  const state = await MarketState.findOne({
    symbol: normalizedSymbol,
  })
    .select(
      "lastPriceCents bestBidCents bestAskCents volume lastTradeAt"
    )
    .lean();

  return {
    symbol: stock.symbol,
    name: stock.name,
    priceDecimals: stock.priceDecimals,
    lastPriceCents: state?.lastPriceCents ?? null,
    bestBidCents: state?.bestBidCents ?? null,
    bestAskCents: state?.bestAskCents ?? null,
    volume: state?.volume ?? 0,
    lastTradeAt: state?.lastTradeAt ?? null,
  };
};
