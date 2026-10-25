
import { getUserPortfolio } from "../services/portfolioService.js";

export const getPortfolio = async (req, res, next) => {
  try {
    const holdings = await getUserPortfolio(req.user._id);

    res.status(200).json({
      success: true,
      data: holdings,
    });
  } catch (error) {
    next(error);
  }
};
