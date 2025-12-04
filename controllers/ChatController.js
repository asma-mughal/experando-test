
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { User } from "../models/UserModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import mongoose from "mongoose";

export const sendMessage = async (req, res) => {
    try {
        const { message, status } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
            status: { $in: ["pending", "accepted"] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                initiatedBy: senderId,
                status: status || "pending",  // Use status from payload, default to 'pending'
                messages: []
            });
        } else {
            // Optionally update the status if needed when the conversation already exists
            conversation.status = status || conversation.status;
            await conversation.save();
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });
        await newMessage.save();

        conversation.messages.push(newMessage._id);
        await conversation.save();

        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        return res.status(200).json({
            message: "Message sent successfully.",
            newMessage,
        });
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const acceptMessageRequest = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const receiverId = req.user._id;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        if (!conversation.participants.includes(receiverId)) {
            return res.status(403).json({ message: "You are not a part of this conversation" });
        }
        conversation.status = "accepted";
        await conversation.save();

        res.status(200).json({ message: "Message request accepted", conversation });
    } catch (error) {
        console.log("Error in acceptMessageRequest controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const declineMessageRequest = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const receiverId = req.user._id;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.participants.includes(receiverId)) {
            return res.status(403).json({ message: "You are not a part of this conversation" });
        }

        // Update status to "declined"
        conversation.status = "declined";

        // Save the updated conversation
        await conversation.save();

        res.status(200).json({ message: "Message request declined and status updated" });
    } catch (error) {
        console.log("Error in declineMessageRequest controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user?._id;

        if (!senderId || !userToChatId) {
            return res.status(400).json({ error: "Sender ID or User To Chat ID is missing" });
        }
        if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(userToChatId)) {
            return res.status(400).json({ error: "Invalid Sender ID or User To Chat ID" });
        }

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        })
        .populate({
            path: 'messages',
            populate: {
                path: 'senderId', 
                model: User
            }
        })
        .populate({
            path: 'participants',
            model: User,
            select: '-password'
        });

        if (!conversation) {
            return res.status(200).json({
                conversation: null,
                messages: []
            });
        }

        const messages = conversation.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.status(200).json({
            conversation: {
                _id: conversation._id,
                participants: conversation.participants, 
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            },
            messages: messages
        });
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const getConversation = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const currentUserId = req.user._id;
        const conversations = await Conversation.find({
            participants: { $all: [currentUserId, receiverId] }
        })
        .populate({
            path: 'participants',
            select: 'fullName profilePicture' 
        })
        .populate({
            path: 'messages',
            populate: {
                path: 'senderId',
                select: 'fullName profilePicture'
            }
        })
        .populate('initiatedBy', 'fullName profilePicture');
        
        res.json(conversations);
    } catch (error) {
        console.error('Error retrieving conversations:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const getAllConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({
            participants: userId
        }).populate({
            path: 'messages',
            populate: { path: 'senderId', select: 'fullName profilePicture' }, // Populate sender details if needed
        });

        if (!conversations.length) return res.status(404).json({ message: "No conversations found" });

        res.status(200).json(conversations);
    } catch (error) {
        console.log("Error in getAllConversations controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const deleteConversationById = async (req, res) => {
    try {
        const { convoId } = req.params;
        if (!convoId) return res.status(400).json({ message: "Conversation ID is required" });

        const deletedConversation = await Conversation.findByIdAndDelete(convoId);

        if (!deletedConversation) return res.status(404).json({ message: "Conversation not found" });

        res.status(200).json({ message: "Conversation deleted successfully", deletedConversation });
    } catch (error) {
        console.log("Error in deleteConversationById controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const deleteAllConversation = async (req, res) => {
  try {
    const result = await Conversation.deleteMany({});
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} Conversation`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Error deleting Conversation", 
      error: error.message 
    });
  }
};
export const deleteAllMessages = async (req, res) => {
  try {
    const result = await Message.deleteMany({});
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} Message`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Error deleting Message", 
      error: error.message 
    });
  }
};
export const startConversation = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ error: "Invalid receiver ID" });
        }

        if (senderId.toString() === receiverId) {
            return res.status(400).json({ error: "Cannot start conversation with yourself" });
        }
        const conversation = await Conversation.create({
            participants: [senderId, receiverId],
            initiatedBy: senderId,
            status: "pending",
            messages: [],
        });

        const populatedConversation = await Conversation.findById(conversation._id)
            .populate({
                path: "participants",
                select: "fullName profilePicture",
            });

        return res.status(201).json({
            message: "Conversation started successfully",
            conversation: populatedConversation,
        });

    } catch (error) {
        console.log("Error in startConversation controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
