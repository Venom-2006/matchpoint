
import { Router } from "express";

const router = Router();

router.get("/live", (req, res) => {
  res.status(200).json({
    success: true,
    status: "alive",
    service: "matchpoint-ai-api",
    timestamp: new Date().toISOString()
  });
});

export default router;
