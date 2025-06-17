import Rating from "../models/ratingModel.js";
import { User } from "../models/UserModel.js";

export const createRating = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;
        const { ratingTo, rating } = req.body;

        const ratingByUser = await User.findById(authenticatedUserId);
        if (!ratingByUser || ratingByUser.userType !== 'client') {
            return res.status(403).json({ message: "Only clients can rate." });
        }

        const ratingToUser = await User.findById(ratingTo);
        if (!ratingToUser || ratingToUser.userType !== 'craftsman') {
            return res.status(403).json({ message: "You can only rate craftsmen." });
        }

        const existingRating = await Rating.findOne({ ratingBy: authenticatedUserId, ratingTo });

        if (existingRating) {
            existingRating.rating = rating;
            await existingRating.save();
            return res.status(200).json(existingRating);
        } else {
            const newRating = new Rating({
                ratingBy: authenticatedUserId,
                ratingTo,
                rating,
            });

            await newRating.save();
            return res.status(201).json(newRating);
        }
    } catch (error) {
        console.error("Error creating or updating rating:", error.message);
        res.status(500).json({ message: "An error occurred while processing your request." });
    }
};


export const getRatings = async (req, res) => {
    try {
        const { id, ratingTo } = req.query;
        if (id) {
            const rating = await Rating.findById(id).populate('ratingBy ratingTo');
            if (!rating) {
                return res.status(404).json({ message: 'Rating not found' });
            }
            return res.status(200).json(rating);
        }
        if (ratingTo) {

            const ratings = await Rating.find({ ratingTo }).populate('ratingBy ratingTo');

            return res.status(200).json(ratings);
        }
        const ratings = await Rating.find().populate('ratingBy ratingTo');
        return res.status(200).json(ratings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRating = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;
        const { ratingId } = req.query;

        const rating = await Rating.findById(ratingId);
        if (!rating) {
            return res.status(404).json({ message: "Rating not found." });
        }

        if (rating.ratingBy.toString() !== authenticatedUserId.toString()) {
            return res.status(403).json({ message: "You can only delete your own ratings." });
        }

        await Rating.deleteOne({ _id: ratingId });
        res.status(200).json({ message: "Rating deleted successfully." });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};
export const getRatingsByRatingTo = async (req, res) => {
    try {
        const { ratingToId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(ratingToId)) {
            return res.status(400).json({ message: 'Invalid ratingTo ID' });
        }
        const ratings = await Rating.find({ ratingTo: ratingToId }).populate('ratingBy');

        if (ratings.length === 0) {
            return res.status(404).json({ message: 'No ratings found for this user' });
        }

        return res.status(200).json(ratings);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteAllRatings = async (req, res) => {
  try {
    const result = await Rating.deleteMany({});
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} Rating`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Error deleting Rating", 
      error: error.message 
    });
  }
};