
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
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                initiatedBy: senderId,
                status: status || "pending",  // Use status from payload, default to 'pending'
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

        // Check if senderId and userToChatId are valid ObjectId strings
        if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(userToChatId)) {
            return res.status(400).json({ error: "Invalid Sender ID or User To Chat ID" });
        }

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate({
            path: 'messages',
            populate: {
                path: 'senderId', // Assuming 'sender' is the field in the message model referencing the User
                model: User
            }
        });

        if (!conversation) return res.status(200).json([]);

        // Sort messages by timestamp in ascending order
        const messages = conversation.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const getConversation = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const conversations = await Conversation.find({ participants: receiverId })
            .populate({
                path: 'participants',
                select: 'name'
            })
            .populate({
                path: 'messages',
                populate: {
                    path: 'senderId',
                    select: 'fullName profilePicture'
                }
            });
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