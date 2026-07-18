import { Conversation } from "../models/Conversation.js";
import ApiError from "../utils/ApiError.js";
export const createDirectConversation = async (senderId, recipientId) => {
  try {
    return await Conversation.create({
      type: "direct",
      participants: [
        { userId: senderId, joinAt: new Date() },
        { userId: recipientId, joinAt: new Date() },
      ],
      lastMessageAt: new Date(),
      unreadCounts: new Map(),
    });
  } catch (err) {
    throw err;
  }
};
export const getConversationById = async (conversationId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new ApiError(404, "Không tìm thấy cuộc trò chuyện")
    return conversation;
  } catch (err) {
    throw err;
  }
};
export const getConversationByUserId = async (userId) => {
  try {
    return await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: "participants.userId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "lastMessage.senderId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "seenBy",
        select: "displayName avatarUrl",
      });
  } catch (err) { throw err };
}
export const createGroupContversation = async (userId, memberIds, name) => {
  try {
    return await Conversation.create({
      type: "group",
      participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],
      group: {
        name,
        createBy: userId,
        createdBy: userId,
      },
      lastMessageAt: new Date(),
    });
  } catch (err) { throw err }
};
export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      { "participants.userId": userId },
      { _id: 1 },
    );

    return conversations.map((c) => c._id.toString());
  } catch (error) {
    console.error("Lỗi khi fetch conversations: ", error);
    return [];
  }
};
export const updateMarkAsSeen = async (conversationId, userId) => {
  try {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { seenBy: userId },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      {
        returnDocument: "after",
      },
    ).populate({
      path: "seenBy",
      select: "displayName avatarUrl",
    });
  } catch (err) { throw err }
}
export const getConversationIdForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find({
      "participants.userId": userId
    }, { _id: 1 })
    return conversations.map((c) => c._id.toString());
  } catch (err) { throw err }
}
export const findDirectConversation = async (userId1, userId2) => {
  console.log("sender", userId1);
  console.log("recipient", userId2);
  return await Conversation.findOne({
    type: "direct",
    "participants.userId": {
      $all: [userId1, userId2]
    }
  });
};