import mongoose from "mongoose";

const jobPromotionSchema = new mongoose.Schema(
  {
    promotionType: {
      type: String,
      enum: ["Service", "Business"],
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    promotionPackage: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      default: "Basic",
    },
    promotionColor: {
      type: String,
      default: "#FFFFFF",
    },
    promotionDurationDays: {
      type: Number,
      required: true,
    },
    promotionPrice: {
      type: Number,
      required: false,
    },
    promotionStartDate: {
      type: Date,
      default: Date.now,
    },
    isActive: { type: Boolean, default: false },
    promotionEndDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Expired"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export const JobPromotion = mongoose.model("JobPromotion", jobPromotionSchema);
