import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { acceptMessageRequest, declineMessageRequest, deleteAllConversation, deleteAllMessages, deleteConversationById, getAllConversations, getConversation, getMessages, sendMessage, startConversation } from '../controllers/ChatController.js';

const router = express.Router();
router.post('/start-conversation/:receiverId', authMiddleware, startConversation);
router.post('/:id', authMiddleware, sendMessage);
router.get('/:id/getMessage', authMiddleware, getMessages);
router.post('/accept/:id', authMiddleware, acceptMessageRequest);
router.post('/decline/:id', authMiddleware, declineMessageRequest);
router.get('/:receiverId', authMiddleware, getConversation);
router.get('/', authMiddleware, getAllConversations);
router.delete('/del/:convoId', deleteConversationById)
router.delete('/', deleteAllConversation)
router.delete('/message', deleteAllMessages)
export default router; 
