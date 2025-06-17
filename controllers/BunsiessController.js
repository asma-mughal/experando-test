import BusinessProfile from "../models/BusniessModel.js";
import moongose from "mongoose";
export const addBusiness = async (req, res) => {
    try {
        const {
            ownerName, businessName, introduction, location, profilePicture, userId,
            status, pictures, tags, schedulingPolicy, licenseImage, startDate, endDate, categoryId
        } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        if (!ownerName || !businessName || !introduction || !location) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const newProfile = new BusinessProfile({
            userId,
            ownerName,
            businessName,
            introduction,
            location,
            pictures: pictures || [],
            profilePicture: profilePicture || '',
            licenseImage: licenseImage || '',
            status: status || 'pending',
            tags: tags || [],
            schedulingPolicy: schedulingPolicy || ' ',
            startDate: startDate || Date.now(),
            endDate,
            categoryId: categoryId || null
        });

        await newProfile.save();
        res.status(201).json(newProfile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


export const deleteBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProfile = await BusinessProfile.findByIdAndDelete(id);

        if (!deletedProfile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        res.status(200).json({ message: 'Business profile deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getBusiness = async (req, res) => {
    const { id, userId } = req.query;
    try {
        if (id) {
            const profile = await BusinessProfile.aggregate([
                { $match: { _id: new moongose.Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' },
                {
                    $lookup: {
                        from: 'ratings',
                        localField: 'userId',
                        foreignField: 'ratingTo',
                        as: 'ratings'
                    }
                }
            ]);

            if (!profile.length) {
                return res.status(200).json([]); // Return empty array instead of 404
            }

            return res.status(200).json(profile[0]);
        } else if (userId) {
            const profiles = await BusinessProfile.aggregate([
                { $match: { userId: new moongose.Types.ObjectId(userId) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' },
                {
                    $lookup: {
                        from: 'ratings',
                        localField: 'userId',
                        foreignField: 'ratingTo',
                        as: 'ratings'
                    }
                }
            ]);

            return res.status(200).json(profiles);
        } else {
            const profiles = await BusinessProfile.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' },
                {
                    $lookup: {
                        from: 'ratings',
                        localField: 'userId',
                        foreignField: 'ratingTo',
                        as: 'ratings'
                    }
                }
            ]);

            return res.status(200).json(profiles);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};


export const updateBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerName, businessName, introduction, location, profilePicture, status, tags, schedulingPolicy, licenseImage, startDate, endDate } = req.body;

        const pictures = [];
        if (req.files && req.files.pictures) {
            for (const picture of req.files.pictures) {
                // Assume that req.files.pictures contains URLs or paths; handle accordingly
                pictures.push(picture.path || picture); // Adjust as needed for your setup
            }
        }

        // Update the business profile with the provided information
        const updatedProfile = await BusinessProfile.findByIdAndUpdate(id, {
            ownerName,
            businessName,
            introduction,
            location,
            pictures,
            profilePicture: profilePicture || '', // Update the profile picture URL directly
            licenseImage: licenseImage || '', // Update the license image URL directly
            status,
            tags: tags || [], // Default to empty array if not provided
            schedulingPolicy: schedulingPolicy || ' ', // Default to empty string if not provided
            startDate, // Update startDate
            endDate // Update endDate
        }, { new: true });

        if (!updatedProfile) {
            return res.status(404).json({ message: 'Business profile not found' });
        }

        res.status(200).json(updatedProfile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteAllBusniess= async (req, res) => {
  try {
    const result = await BusinessProfile.deleteMany({});
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} BusinessProfile`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Error deleting BusinessProfile", 
      error: error.message 
    });
  }
};