import Message from "../models/Message.js";
export const createMessage = async (conversationId, senderId, content) => {
  try {
    return Message.create({
      conversationId,
      senderId,
      content,
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
