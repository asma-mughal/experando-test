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
            "https://images.pexels.com/photos/9072375/pexels-photo-9072375.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
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
    },
     isActive: {
      type: Boolean,
      default: true, 
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);
export { User };
