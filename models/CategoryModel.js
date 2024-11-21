import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        trim: true,
        enum: ['build', 'renovation and refurbishment', 'vehicles']
    }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
