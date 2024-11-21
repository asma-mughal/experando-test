import mongoose from 'mongoose';

const { Schema } = mongoose;

const businessProfileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true,
        default: ' '
    },
    businessName: {
        type: String,
        required: true,
        trim: true,
        default: ' '
    },
    introduction: {
        type: String,
        required: true,
        trim: true,
        default: ' '
    },
    location: {
        type: String,
        required: true,
        trim: true,
        default: ' '
    },
    pictures: [{
        type: String,
        trim: true,
        default: []
    }],
    profilePicture: {
        type: String,
        trim: true,
        default: ' '
    },
    licenseImage: {
        type: String,
        trim: true,
        default: ' '
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'pending'
    },
    tags: [{
        type: String,
        trim: true
    }],
    schedulingPolicy: {
        type: String,
        trim: true,
        default: ' '
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    }
}, {
    timestamps: true
});

const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema);
export default BusinessProfile;
