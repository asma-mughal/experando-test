import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['request', 'chat', 'payment', 'assigned'],
        default: 'request',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    relatedId: {
        type: Schema.Types.ObjectId,
        required: false,
    },
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
