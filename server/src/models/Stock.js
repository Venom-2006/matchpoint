
import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, "Stock symbol is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 1,
      maxlength: 10,
      match: /^[A-Z0-9.]+$/,
    },

    name: {
      type: String,
      required: [true, "Stock name is required"],
      trim: true,
      maxlength: 100,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },

    priceDecimals: {
      type: Number,
      default: 2,
      enum: [2],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;
