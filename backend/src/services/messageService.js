import Message from "../models/Message.js";
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
