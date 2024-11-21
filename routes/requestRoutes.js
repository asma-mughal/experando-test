import express from 'express';
import { createRequest, getRequests, updateRequestStatus } from '../controllers/RequestController.js';

const router = express.Router();

// POST route to create a new request
router.post('/', createRequest);
router.get('/', getRequests);
router.put('/:requestId', updateRequestStatus);

export default router;
