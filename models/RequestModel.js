import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the Request Schema
const requestSchema = new Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,  // Assuming this is a user ID
        ref: 'User',  // Assuming you have a User model
        required: true
    },
    requestee: {
        type: mongoose.Schema.Types.ObjectId,  // Assuming this is a user ID
        ref: 'User',  // Assuming you have a User model
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],  // Status options
        default: 'pending'  // Default status
    }
}, { timestamps: true });

const Request = mongoose.model('Request', requestSchema);
export default Request;
