import { asyncHandler } from "../utils/asyncHandle.js";
import { createDirectConversation, getConversationById } from "../services/conversationService.js";
import { createMessage } from "../services/messageService.js"
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";
import { emitNewMessage } from "../socket/messageSocket.js";
import { io } from "../socket/index.js";
export const sendDirectMessage = asyncHandler(async (req, res) => {
    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user._id;
    let conversation;
    if (conversationId) {
        conversation = await getConversationById(conversationId)
    }
    if (!conversation) {
        conversation = await createDirectConversation(senderId, recipientId);
    }
    const message = await createMessage(conversation._id, senderId, content);
    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();
    emitNewMessage(io, conversation, message);
    return res.status(200).json({ message });
})
export const sendGroupMessage = asyncHandler(async (req, res) => {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;
    const message = await createMessage(conversationId, senderId, content);
    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();
    return res.status(201).json({ message });
})