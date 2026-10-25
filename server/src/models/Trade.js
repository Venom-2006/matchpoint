
import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9.]+$/,
      maxlength: 10,
    },
    buyOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    sellOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priceCents: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Trade price must be a positive integer number of cents",
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Trade quantity must be a positive integer",
      },
    },
    executedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

tradeSchema.index({ symbol: 1, executedAt: -1 });
tradeSchema.index({ buyerId: 1, executedAt: -1 });
tradeSchema.index({ sellerId: 1, executedAt: -1 });
tradeSchema.index({ buyOrderId: 1 });
tradeSchema.index({ sellOrderId: 1 });

const Trade = mongoose.model("Trade", tradeSchema);

export default Trade;
