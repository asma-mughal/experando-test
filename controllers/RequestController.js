import Request from "../models/RequestModel.js";

// Create a new request
export const createRequest = async (req, res) => {
    const { requester, requestee, status } = req.body;
    try {
        const request = await Request.create({ requester, requestee, status });
        res.status(201).json({ message: 'Request created successfully', request });
    } catch (error) {

        res.status(400).json({ message: 'Failed to create request', error: error.message });
    }
};
export const getRequests = async (req, res) => {
    const { requestId } = req.query;

    try {
        if (requestId) {
            // Fetch a specific request by requestId
            const request = await Request.findById(requestId).populate('requester requestee');
            if (!request) {
                return res.status(404).json({ message: 'Request not found' });
            }
            return res.status(200).json({ message: 'Request fetched successfully', request });
        } else {
            // Fetch all requests if no requestId is provided
            const requests = await Request.find().populate('requester requestee');
            return res.status(200).json({ message: 'All requests fetched successfully', requests });
        }
    } catch (error) {
        return res.status(400).json({ message: 'Failed to fetch requests', error: error.message });
    }
};


// Update request status (accept/reject)
export const updateRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;  // Can be 'accepted' or 'rejected'

    try {
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        request.status = status;
        await request.save();
        res.status(200).json({ message: 'Request updated successfully', request });
    } catch (error) {
        res.status(400).json({ message: 'Failed to update request', error: error.message });
    }
};
export const deleteAllRequests = async (req, res) => {
  try {
 
    const result = await Request.deleteMany({});
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} requests`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error deleting requests:', error);
    return res.status(500).json({ 
      message: 'Failed to delete requests', 
      error: error.message 
    });
  }
};