import express from 'express';
import { createNotification, deleteNotification, getNotifications, markAsRead } from '../controllers/NotificationController.js';

const router = express.Router();

router.get('/getNoti', getNotifications);
router.post('/', createNotification);
router.put('/', markAsRead);
router.delete('/', deleteNotification);
export default router;
