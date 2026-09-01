import { asyncHandler } from "../utils/asyncHandle.js";
import {
    sendMessageService,
    recallMessageService,
    searchMessagesService,
} from "../services/messageService.js";

export const sendMessage = asyncHandler(async (req, res) => {
    const { content, voiceDuration } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    const result = await sendMessageService({
        conversation,
        senderId,
        content,
        voiceDuration,
        files: req.files,
    });

    return res.status(200).json(result);
});

export const recallMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id;

    const result = await recallMessageService(messageId, userId);
    return res.status(200).json(result);
});

export const searchMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { query } = req.query;

    const result = await searchMessagesService(conversationId, query);
    return res.status(200).json(result);
});
