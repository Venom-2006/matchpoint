
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_BYTES = 72;
const JWT_EXPIRES_IN = "1h";

const normalizeEmail = (email) => email.trim().toLowerCase();

const normalizeUsername = (username) => username.trim().toLowerCase();

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const validatePassword = (password) => {
  if (typeof password !== "string") {
    throw createError("Password is required", 400);
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw createError("Password must be at least 8 characters", 400);
  }

  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    throw createError("Password must not exceed 72 UTF-8 bytes", 400);
  }
};

const validateCredentials = ({ username, email, password }) => {
  if (
    typeof username !== "string" ||
    username.trim().length < 3 ||
    username.trim().length > 24 ||
    !/^[a-zA-Z0-9_]+$/.test(username.trim())
  ) {
    throw createError(
      "Username must be 3–24 letters, numbers, or underscores",
      400
    );
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.trim().length > 254
  ) {
    throw createError("A valid email is required", 400);
  }

  validatePassword(password);
};

const createAccessToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be configured with at least 32 characters"
    );
  }

  return jwt.sign(
    { sub: user._id.toString() },
    secret,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "matchpoint-ai",
    }
  );
};

const publicUser = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  cashBalanceCents: user.cashBalanceCents,
  reservedCashCents: user.reservedCashCents,
  status: user.status,
  createdAt: user.createdAt,
});

export const registerUser = async ({ username, email, password }) => {
  validateCredentials({ username, email, password });

  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      cashBalanceCents: 10_000_000,
      reservedCashCents: 0,
    });

    return {
      user: publicUser(user),
      token: createAccessToken(user),
    };
  } catch (error) {
    if (error.code === 11000) {
      throw createError("Username or email is already registered", 409);
    }

    if (error.name === "ValidationError") {
      throw createError("Invalid registration details", 400);
    }

    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    throw createError("Email and password are required", 400);
  }

  const user = await User.findOne({
    email: normalizeEmail(email),
  }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw createError("Invalid email or password", 401);
  }

  if (user.status !== "active") {
    throw createError("This account is suspended", 403);
  }

  return {
    user: publicUser(user),
    token: createAccessToken(user),
  };
};
