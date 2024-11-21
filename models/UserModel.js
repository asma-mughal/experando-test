import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    userType: {
        type: String,
        required: true,
        enum: ['craftsman', 'client', 'admin']
    },
    profilePicture: {
        type: String,
        default:
            "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
    },
    facebookId: {
        type: String,
    },
    jobsDone: {
        type: Number,
        default: 0,
    },
    totalHires: {
        type: Number,
        default: 0,
    },
    stripeCustomerId: {
        type: String,
    }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);
export { User };
