import { asyncHandler } from "../utils/asyncHandle.js";
import { createDirectConversation, findDirectConversation } from "../services/conversationService.js";
import { createMessage } from "../services/messageService.js"
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";
import { emitNewMessage } from "../socket/messageSocket.js";
import { io } from "../socket/index.js";
import { uploadToStorage, uploadMultipleToStorage } from "../services/storageService.js";
import { Conversation } from "../models/Conversation.js";
import Message from "../models/Message.js";

export const sendDirectMessage = asyncHandler(async (req, res) => {
    const { content, voiceDuration } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;
    const imgUrls = [];
    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    let voiceUrl = null;

    if (req.files) {
        if (req.files.images && req.files.images.length > 0) {
            const paths = await uploadMultipleToStorage(req.files.images);
            imgUrls.push(...paths);
        }
        if (req.files.file && req.files.file.length > 0) {
            const uploadedFile = req.files.file[0];
            fileUrl = await uploadToStorage(uploadedFile);
            fileName = uploadedFile.originalname;
            fileType = uploadedFile.mimetype;
        }
        if (req.files.voice && req.files.voice.length > 0) {
            const uploadedVoice = req.files.voice[0];
            voiceUrl = await uploadToStorage(uploadedVoice);
        }
    }

    const message = await createMessage(conversation._id, senderId, content, imgUrls, {
        fileUrl,
        fileName,
        fileType,
        voiceUrl,
        voiceDuration: voiceDuration ? Number(voiceDuration) : null,
    });
    await updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();
    emitNewMessage(io, conversation, message);
    return res.status(200).json({ message });
})

export const sendGroupMessage = asyncHandler(async (req, res) => {
    const { conversationId, content, voiceDuration } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (conversation && conversation.isDeleted) {
        return res.status(400).json({ message: "Không thể gửi tin nhắn. Nhóm này đã bị giải tán." });
    }

    const imgUrls = [];
    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    let voiceUrl = null;

    if (req.files) {
        if (req.files.images && req.files.images.length > 0) {
            const paths = await uploadMultipleToStorage(req.files.images);
            imgUrls.push(...paths);
        }
        if (req.files.file && req.files.file.length > 0) {
            const uploadedFile = req.files.file[0];
            fileUrl = await uploadToStorage(uploadedFile);
            fileName = uploadedFile.originalname;
            fileType = uploadedFile.mimetype;
        }
        if (req.files.voice && req.files.voice.length > 0) {
            const uploadedVoice = req.files.voice[0];
            voiceUrl = await uploadToStorage(uploadedVoice);
        }
    }

    const message = await createMessage(conversationId, senderId, content, imgUrls, {
        fileUrl,
        fileName,
        fileType,
        voiceUrl,
        voiceDuration: voiceDuration ? Number(voiceDuration) : null,
    });
    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();
    emitNewMessage(io, conversation, message);
    return res.status(201).json({ message });
});

export const recallMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id.toString();

    const message = await Message.findById(messageId);
    if (!message) {
        return res.status(404).json({ message: "Không tìm thấy tin nhắn" });
    }

    if (message.senderId && message.senderId.toString() !== userId) {
        return res.status(403).json({ message: "Bạn không có quyền thu hồi tin nhắn này" });
    }

    if (message.isRecalled) {
        return res.status(400).json({ message: "Tin nhắn đã được thu hồi trước đó" });
    }

    message.content = "Tin nhắn đã bị thu hồi";
    message.isRecalled = true;
    message.imgUrls = [];
    message.fileUrl = null;
    message.fileName = null;
    message.fileType = null;
    message.voiceUrl = null;
    message.voiceDuration = null;

    await message.save();

    const conversation = await Conversation.findById(message.conversationId);
    if (conversation && conversation.lastMessage && conversation.lastMessage._id.toString() === messageId) {
        conversation.lastMessage.content = "Tin nhắn đã bị thu hồi";
        conversation.markModified("lastMessage");
        await conversation.save();
    }

    io.to(message.conversationId.toString()).emit("message-recalled", {
        messageId,
        conversationId: message.conversationId,
        lastMessage: conversation ? conversation.lastMessage : null
    });

    return res.status(200).json({ message });
});

export const searchMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: "Từ khóa tìm kiếm không được để trống" });
    }

    const messages = await Message.find({
        conversationId,
        content: { $regex: query, $options: "i" },
        isSystem: { $ne: true },
        isRecalled: { $ne: true }
    })
    .sort({ createdAt: 1 })
    .populate("senderId", "displayName avatarUrl");

    return res.status(200).json({ messages });
});