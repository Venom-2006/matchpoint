
import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9.]+$/,
      maxlength: 10,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Portfolio quantity must be a non-negative integer",
      },
    },
    
totalCostBasisCents: {
  type: Number,
  required: true,
  default: 0,
  min: 0,
  validate: {
    validator: Number.isSafeInteger,
    message: "Total cost basis must be a non-negative integer number of cents",
  },
},

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

portfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true });
portfolioSchema.index({ userId: 1 });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
