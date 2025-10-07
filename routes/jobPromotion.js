import express from "express";
import {
  cancelJobPromotion,
  deleteAllJobsPromotions,
  subscribeToJobPromotion,
  subscriptionSuccess,
} from "../controllers/JobPromotionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/subscribe",authMiddleware, subscribeToJobPromotion);
router.post("/success", authMiddleware, subscriptionSuccess);
router.post("/cancel",authMiddleware, cancelJobPromotion);
router.delete("/", authMiddleware, deleteAllJobsPromotions);
export default router;
