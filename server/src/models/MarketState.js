
import mongoose from "mongoose";

const marketStateSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9.]+$/,
      maxlength: 10,
    },
    lastPriceCents: {
      type: Number,
      default: null,
      validate: {
        validator: (value) =>
          value === null ||
          (Number.isSafeInteger(value) && value > 0),
        message: "Last price must be a positive integer number of cents",
      },
    },
    bestBidCents: {
      type: Number,
      default: null,
      validate: {
        validator: (value) =>
          value === null ||
          (Number.isSafeInteger(value) && value > 0),
        message: "Best bid must be a positive integer number of cents",
      },
    },
    bestAskCents: {
      type: Number,
      default: null,
      validate: {
        validator: (value) =>
          value === null ||
          (Number.isSafeInteger(value) && value > 0),
        message: "Best ask must be a positive integer number of cents",
      },
    },
    volume: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Volume must be a non-negative integer",
      },
    },
    lastTradeAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const MarketState = mongoose.model("MarketState", marketStateSchema);

export default MarketState;
