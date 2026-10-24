
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

export const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw createError("Authentication required", 401);
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw createError("Authentication required", 401);
    }

    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error("JWT_SECRET is not configured correctly");
    }

    let decoded;

    try {
      decoded = jwt.verify(token, secret, {
        issuer: "matchpoint-ai",
        algorithms: ["HS256"],
      });
    } catch {
      throw createError("Invalid or expired token", 401);
    }

    if (
      typeof decoded.sub !== "string" ||
      !/^[a-f\d]{24}$/i.test(decoded.sub)
    ) {
      throw createError("Invalid authentication token", 401);
    }

   const user = await User.findById(decoded.sub).select(
  "_id username email cashBalanceCents reservedCashCents status"
);
    if (!user) {
      throw createError("User account not found", 401);
    }

    if (user.status !== "active") {
      throw createError("This account is suspended", 403);
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
