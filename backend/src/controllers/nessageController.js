import { asyncHandler } from "../utils/asyncHandle.js";
import { createDirectConversation, findDirectConversation } from "../services/conversationService.js";
import { createMessage } from "../services/messageService.js"
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";
import { emitNewMessage } from "../socket/messageSocket.js";
import { io } from "../socket/index.js";
import { uploadToStorage, uploadMultipleToStorage } from "../services/storageService.js";

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
    console.log("start emit")
    emitNewMessage(io, conversation, message);
    return res.status(201).json({ message });
})