import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobName: {
      type: String,
      required: true,
      default: "New Job",
    },
    ownerName: {
      type: String,
      required: true,
      default: "Anonymous",
    },
    jobDescription: {
      type: String,
      required: true,
      default: "No description provided",
    },
    price: {
      type: Number,
      default: 0,
    },
    urgency: {
      type: String,
      enum: [
        "Urgent",
        "After Consultation",
        "Within 2 weeks",
        "Within a month",
        "Within a few months",
      ],
      default: "After Consultation",
    },
    location: {
      type: String,
      required: true,
      default: "Not specified",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Pending", "InProgress", "Completed", "Cancelled"],
      default: "Pending",
    },
    ratings: {
      type: [Number],
      default: [],
    },
    promoted: {
      type: Boolean,
      default: false,
    },
    pictures: [
      {
        type: String,
        default: [],
      },
    ],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
