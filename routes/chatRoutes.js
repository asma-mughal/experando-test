import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'; // Assuming you have an authentication middleware
import { acceptMessageRequest, declineMessageRequest, deleteConversationById, getAllConversations, getConversation, getMessages, sendMessage } from '../controllers/ChatController.js';

const router = express.Router();

router.post('/:id', authMiddleware, sendMessage);
router.get('/:id/getMessage', authMiddleware, getMessages);
router.post('/accept/:id', authMiddleware, acceptMessageRequest);
router.post('/decline/:id', authMiddleware, declineMessageRequest);
router.get('/:receiverId', authMiddleware, getConversation);
router.get('/', authMiddleware, getAllConversations);
router.delete('/del/:convoId', deleteConversationById)
export default router; 
