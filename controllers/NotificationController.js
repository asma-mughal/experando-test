import Notification from "../models/NotificationModel.js";
import mongoose from "mongoose";

export const createNotification = async (req, res) => {
    try {
        const { userId, senderId, message, type, relatedId } = req.body;
        if (!userId || !senderId || !message) {
            return res.status(400).json({ message: 'userId, senderId, and message are required.' });
        }

        const notification = new Notification({
            userId,
            senderId,
            message,
            isRead: false,
            type,
            relatedId

        });

        await notification.save();

        res.status(201).json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating notification', error: error.message });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        const notifications = await Notification.find({ userId });

        return res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};


export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.query;
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.query;
        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting notification', error: error.message });
    }
};
export const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({});
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} Notification`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Error deleting Notification", 
      error: error.message 
    });
  }
};