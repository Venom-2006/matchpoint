
import {
  registerUser,
  loginUser,
} from "../services/authService.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};



export const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id.toString(),
        username: req.user.username,
        email: req.user.email,
        cashBalanceCents: req.user.cashBalanceCents,
        reservedCashCents: req.user.reservedCashCents,
        status: req.user.status,
      },
    },
  });
};
