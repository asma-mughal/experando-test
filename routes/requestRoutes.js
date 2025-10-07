import express from 'express';
import { createRequest, deleteAllRequests, getRequests, updateRequestStatus } from '../controllers/RequestController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// POST route to create a new request
router.post('/',authMiddleware, createRequest);
router.get('/',authMiddleware, getRequests);
router.put('/:requestId',authMiddleware, updateRequestStatus);
router.delete('/',authMiddleware, deleteAllRequests);
export default router;
