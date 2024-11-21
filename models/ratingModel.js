import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
    {
        ratingBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ratingTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
    },
    { timestamps: true }
);

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
