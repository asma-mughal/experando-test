import express from 'express';
import { createNotification, deleteAllNotifications, deleteNotification, getNotifications, markAsRead } from '../controllers/NotificationController.js';

const router = express.Router();

router.get('/getNoti', getNotifications);
router.post('/', createNotification);
router.put('/', markAsRead);
router.delete('/', deleteNotification);
router.delete('/all', deleteAllNotifications);
export default router;
