
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9.]+$/,
      maxlength: 10,
    },

    side: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },

    type: {
      type: String,
      enum: ["market", "limit"],
      required: true,
    },

    priceCents: {
      type: Number,
      default: null,
      min: 1,
      validate: {
        validator: (value) =>
          value === null ||
          (Number.isSafeInteger(value) && value > 0),
        message: "Price must be a positive integer number of cents",
      },
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Quantity must be a positive integer",
      },
    },

    filledQuantity: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Filled quantity must be a non-negative integer",
      },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "open",
        "partially_filled",
        "filled",
        "cancelled",
        "rejected",
      ],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.index({ symbol: 1, side: 1, status: 1, createdAt: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
