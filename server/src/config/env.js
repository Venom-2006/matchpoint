
import dotenv from "dotenv";

dotenv.config();

const requiredVariables = ["MONGODB_URI", "CLIENT_URL"];

if (process.env.NODE_ENV !== "test") {
  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      throw new Error(
        `Missing required environment variable: ${variable}`
      );
    }
  }
}

const port = Number(process.env.PORT || 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid port number");
}

export const env = Object.freeze({
  port,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || ""
});
