import Message from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
import ApiError from "../utils/ApiError.js";
import { processMessageFiles, updateConversationAfterCreateMessage } from "../utils/messageHelper.js";
import { emitNewMessage } from "../socket/messageSocket.js";
import { io } from "../socket/index.js";

export const createMessage = async (conversationId, senderId, content, imgUrls = [], extra = {}) => {
  try {
    return await Message.create({
      conversationId,
      senderId,
      content,
      imgUrls,
      fileUrl: extra.fileUrl || null,
      fileName: extra.fileName || null,
      fileType: extra.fileType || null,
      voiceUrl: extra.voiceUrl || null,
      voiceDuration: extra.voiceDuration || null,
    });
  } catch (err) {
    throw err;
  }
};

export const getMessagesPage = async (query, limit) => {
  try {
    return await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);
  } catch (err) {
    throw err;
  }
};

export const sendMessageService = async ({ conversation, senderId, content, voiceDuration, files }) => {
    if (conversation && conversation.isDeleted) {
        throw new ApiError(400, "Không thể gửi tin nhắn. Nhóm này đã bị giải tán.");
    }

    const { imgUrls, fileUrl, fileName, fileType, voiceUrl } = await processMessageFiles(files);

    const message = await createMessage(conversation._id, senderId, content, imgUrls, {
        fileUrl,
        fileName,
        fileType,
        voiceUrl,
        voiceDuration: voiceDuration ? Number(voiceDuration) : null,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();
    emitNewMessage(io, conversation, message);

    return { message };
};

export const recallMessageService = async (messageId, userId) => {
    const message = await Message.findById(messageId);
    if (!message) {
        throw new ApiError(404, "Không tìm thấy tin nhắn");
    }

    if (message.senderId && message.senderId.toString() !== userId.toString()) {
        throw new ApiError(403, "Bạn không có quyền thu hồi tin nhắn này");
    }

    if (message.isRecalled) {
        throw new ApiError(400, "Tin nhắn đã được thu hồi trước đó");
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

    return { message };
};

export const searchMessagesService = async (conversationId, query) => {
    if (!query) {
        throw new ApiError(400, "Từ khóa tìm kiếm không được để trống");
    }

    const messages = await Message.find({
        conversationId,
        content: { $regex: query, $options: "i" },
        isSystem: { $ne: true },
        isRecalled: { $ne: true }
    })
    .sort({ createdAt: 1 })
    .populate("senderId", "displayName avatarUrl");

    return { messages };
};