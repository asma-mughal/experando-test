import express from "express";
import {
  cancelJobPromotion,
  subscribeToJobPromotion,
  subscriptionSuccess,
} from "../controllers/JobPromotionController.js";

const router = express.Router();
router.post("/subscribe", subscribeToJobPromotion);
router.post("/success", subscriptionSuccess);
router.post("/cancel", cancelJobPromotion);
export default router;
