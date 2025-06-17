import express from 'express';
import { createRequest, deleteAllRequests, getRequests, updateRequestStatus } from '../controllers/RequestController.js';

const router = express.Router();

// POST route to create a new request
router.post('/', createRequest);
router.get('/', getRequests);
router.put('/:requestId', updateRequestStatus);
router.delete('/', deleteAllRequests);
export default router;
