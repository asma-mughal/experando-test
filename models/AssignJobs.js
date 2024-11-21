import mongoose from 'mongoose';

const assignJobSchema = new mongoose.Schema({
    assignToId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    }
}, {
    timestamps: true
});

const AssignJob = mongoose.model('AssignJob', assignJobSchema);
export default AssignJob;
