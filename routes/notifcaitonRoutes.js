import express from 'express';
import { createNotification, deleteAllNotifications, deleteNotification, getNotifications, markAsRead } from '../controllers/NotificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/getNoti',authMiddleware, getNotifications);
router.post('/',authMiddleware, createNotification);
router.put('/', authMiddleware,markAsRead);
router.delete('/',authMiddleware, deleteNotification);
router.delete('/all',authMiddleware, deleteAllNotifications);
export default router;
