import AssignJob from "../models/AssignJobs.js";
import Service from "../models/ServiceModel.js";


export const createAssignJob = async (req, res) => {
    const { assignToId, assignedById, serviceId } = req.body;
    try {
        const assignJob = new AssignJob({
            assignToId,
            assignedById,
            serviceId
        });
        const savedAssignJob = await assignJob.save();
        res.status(201).json(savedAssignJob);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAssignJobs = async (req, res) => {
    try {
        const assignJobs = await AssignJob.find().populate('assignToId assignedById serviceId');
        res.status(200).json(assignJobs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAssignJobById = async (req, res) => {
    const { assignToId, assignedById } = req.query;
    try {
        const assignJob = await AssignJob.findOne({
            assignToId: assignToId,
            assignedById: assignedById
        })
            .populate('assignToId')
            .populate('assignedById')
            .populate('serviceId');

        if (!assignJob) {
            return res.status(200).json([]);
        }

        res.status(200).json(assignJob);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const updateAssignJob = async (req, res) => {
    const { id } = req.params;
    const { assignToId, assignedById, serviceId } = req.body;
    try {
        const assignJob = await AssignJob.findByIdAndUpdate(
            id,
            { assignToId, assignedById, serviceId },
            { new: true }
        );
        if (!assignJob) return res.status(404).json({ message: 'AssignJob not found' });
        res.status(200).json(assignJob);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteAssignJob = async (req, res) => {
    const { id } = req.query;
    try {
        const assignJob = await AssignJob.findByIdAndDelete(id);
        if (!assignJob) return res.status(404).json({ message: 'AssignJob not found' });
        await Service.findByIdAndUpdate(assignJob.serviceId, { status: 'Pending' });
        res.status(200).json({ message: 'AssignJob deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const deleteAllAssignJobs= async (req, res) => {
  try {
    const result = await AssignJob.deleteMany({});
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} AssignJob`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Error deleting AssignJob", 
      error: error.message 
    });
  }
};