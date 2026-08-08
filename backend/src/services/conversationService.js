import { Conversation } from "../models/Conversation.js";
import Message from "../models/Message.js";
import { User } from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { io, emitToUser } from "../socket/index.js";
import { emitNewMessage, readMessage } from "../socket/messageSocket.js";
import { getMessagesPage } from "./messageService.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";

export const formatParticipant = (p) => ({
  _id: p.userId?._id || p.userId,
  displayName: p.userId?.displayName || "",
  avatarUrl: p.userId?.avatarUrl ?? null,
  joinedAt: p.joinedAt,
  clearedAt: p.clearedAt ?? null,
});

export const formatLastMessage = (lastMessage, clearedAt) => {
  if (!lastMessage) return null;
  const msgObj = typeof lastMessage.toObject === "function" ? lastMessage.toObject() : lastMessage;
  if (clearedAt && new Date(msgObj.createdAt) <= new Date(clearedAt)) {
    return {
      ...msgObj,
      content: "Dữ liệu cũ đã bị xóa",
    };
  }
  return msgObj;
};

export const formatConversation = (convo, userId) => {
  const convoObj = typeof convo.toObject === "function" ? convo.toObject() : convo;
  const participants = (convo.participants || []).map(formatParticipant);
  const myParticipant = (convo.participants || []).find(
    (p) => (p.userId?._id || p.userId).toString() === userId.toString()
  );
  const myClearedAt = myParticipant?.clearedAt;
  const lastMessage = formatLastMessage(convo.lastMessage, myClearedAt);

  return {
    ...convoObj,
    unreadCounts: convo.unreadCounts || {},
    participants,
    lastMessage,
  };
};

export const populateConversationDetails = async (conversation) => {
  return await conversation.populate([
    { path: "participants.userId", select: "displayName avatarUrl" },
    { path: "seenBy", select: "displayName avatarUrl" },
    { path: "lastMessage.senderId", select: "displayName avatarUrl" },
  ]);
};

export const createDirectConversation = async (senderId, recipientId) => {
  return await Conversation.create({
    type: "direct",
    participants: [
      { userId: senderId, joinAt: new Date() },
      { userId: recipientId, joinAt: new Date() },
    ],
    lastMessageAt: new Date(),
    unreadCounts: new Map(),
  });
};

export const createGroupContversation = async (userId, memberIds, name) => {
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
};

export const getConversationById = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, "Không tìm thấy cuộc trò chuyện");
  return conversation;
};

export const getConversationByUserId = async (userId) => {
  return await Conversation.find({
    $or: [{ "participants.userId": userId }, { removedUsers: userId }],
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
};

export const createConversationService = async (userId, { name, memberIds }) => {
  let conversation;

  if (!name && memberIds && memberIds.length === 1) {
    const recipientId = memberIds[0];
    const userConversations = await getConversationByUserId(userId);
    const existing = userConversations.find(
      (c) => c.type === "direct" && c.participants.some((p) => p.userId?._id.toString() === recipientId)
    );
    if (existing) {
      return { conversation: formatConversation(existing, userId) };
    }
    conversation = await createDirectConversation(userId, recipientId);
  } else {
    conversation = await createGroupContversation(userId, memberIds, name);
  }

  await populateConversationDetails(conversation);
  const formatted = formatConversation(conversation, userId);
  const conversationId = conversation._id.toString();

  formatted.participants.forEach((p) => {
    if (p._id) {
      emitToUser(p._id.toString(), "new-conversation", { conversation: formatted, conversationId });
    }
  });

  return { conversation: formatted };
};

export const getConversationsService = async (userId) => {
  const conversations = await getConversationByUserId(userId);
  const formatted = conversations.map((convo) => formatConversation(convo, userId));
  return { conversations: formatted };
};

export const getMessagesService = async (userId, conversationId, { limit = 50, cursor }) => {
  const conversation = await getConversationById(conversationId);
  const myParticipant = conversation.participants.find((p) => p.userId.toString() === userId.toString());
  const myClearedAt = myParticipant?.clearedAt;

  const query = { conversationId };
  if (myClearedAt) {
    query.createdAt = { $gt: new Date(myClearedAt) };
  }

  if (cursor) {
    const cursorDate = new Date(cursor);
    if (myClearedAt && cursorDate <= new Date(myClearedAt)) {
      return { messages: [], nextCursor: null };
    }
    if (query.createdAt) {
      query.createdAt = { ...query.createdAt, $lt: cursorDate };
    } else {
      query.createdAt = { $lt: cursorDate };
    }
  }

  let messages = await getMessagesPage(query, limit);
  let nextCursor = null;
  if (messages.length > Number(limit)) {
    const nextMessage = messages[messages.length - 1];
    nextCursor = nextMessage.createdAt.toISOString();
    messages.pop();
  }
  messages = messages.reverse();
  return { messages, nextCursor };
};

export const updateMarkAsSeen = async (conversationId, userId) => {
  return await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $addToSet: { seenBy: userId },
      $set: { [`unreadCounts.${userId}`]: 0 },
    },
    { returnDocument: "after" }
  ).populate({
    path: "seenBy",
    select: "displayName avatarUrl",
  });
};

export const markAsSeenService = async (userId, conversationId) => {
  const conversation = await getConversationById(conversationId);
  const last = conversation.lastMessage;
  if (!last) {
    return { message: "Không có tin nhắn để mark as seen" };
  }

  if (last.senderId.toString() === userId.toString()) {
    return { message: "Sender không cần mark as seen" };
  }

  const updated = await updateMarkAsSeen(conversationId, userId);
  await populateConversationDetails(updated);

  const formatted = formatConversation(updated, userId);
  await readMessage(io, formatted);

  return {
    message: "Marked as seen",
    seenBy: formatted.seenBy || [],
    myUnreadCount: formatted.unreadCounts[userId] || 0,
  };
};

export const clearConversationService = async (userId, conversationId) => {
  const conversation = await getConversationById(conversationId);
  const participant = conversation.participants.find((p) => p.userId.toString() === userId.toString());
  if (!participant) {
    throw new ApiError(403, "Bạn không tham gia cuộc trò chuyện này");
  }

  participant.clearedAt = new Date();
  await conversation.save();

  return { message: "Xóa lịch sử trò chuyện thành công", clearedAt: participant.clearedAt };
};

export const deleteGroupService = async (userId, conversationId) => {
  const conversation = await getConversationById(conversationId);
  if (conversation.type !== "group") {
    throw new ApiError(400, "Cuộc trò chuyện này không phải là nhóm");
  }

  const creatorId = conversation.group?.createdBy?.toString() || conversation.group?.createBy?.toString();
  if (creatorId !== userId.toString()) {
    throw new ApiError(403, "Chỉ trưởng nhóm mới có quyền xóa nhóm");
  }

  conversation.isDeleted = true;
  await conversation.save();

  io.to(conversationId).emit("group-deleted", { conversationId });

  return { message: "Xóa nhóm thành công", conversationId };
};

export const addMembersService = async (userId, conversationId, memberIds, adderName) => {
  const conversation = await getConversationById(conversationId);
  if (conversation.type !== "group") {
    throw new ApiError(400, "Cuộc trò chuyện này không phải là nhóm");
  }

  const existingMemberIds = conversation.participants.map((p) => p.userId.toString());
  const newMemberIds = memberIds.filter((id) => !existingMemberIds.includes(id));

  if (newMemberIds.length === 0) {
    throw new ApiError(400, "Các thành viên đều đã có trong nhóm");
  }

  newMemberIds.forEach((id) => {
    conversation.participants.push({ userId: id, joinAt: new Date() });
    conversation.removedUsers = conversation.removedUsers.filter((rId) => rId.toString() !== id);
  });

  const addedUsers = await User.find({ _id: { $in: newMemberIds } }).select("displayName");
  const addedNames = addedUsers.map((u) => u.displayName).join(", ");
  const content = `${adderName} đã thêm ${addedNames} vào nhóm.`;

  const systemMessage = await Message.create({
    conversationId,
    content,
    isSystem: true,
  });

  updateConversationAfterCreateMessage(conversation, systemMessage, null);
  await conversation.save();

  emitNewMessage(io, conversation, systemMessage);
  await populateConversationDetails(conversation);

  const formatted = formatConversation(conversation, userId);

  newMemberIds.forEach((id) => {
    emitToUser(id, "new-conversation", { conversation: formatted, conversationId });
  });

  io.to(conversationId).emit("group-updated", { conversation: formatted });

  return { conversation: formatted };
};

export const removeMemberService = async (userId, conversationId, memberId, removerName) => {
  const conversation = await getConversationById(conversationId);
  if (conversation.type !== "group") {
    throw new ApiError(400, "Cuộc trò chuyện này không phải là nhóm");
  }

  const creatorId = conversation.group?.createdBy?.toString() || conversation.group?.createBy?.toString();
  if (creatorId !== userId.toString() && userId.toString() !== memberId) {
    throw new ApiError(403, "Chỉ trưởng nhóm mới có quyền xóa thành viên");
  }

  conversation.participants = conversation.participants.filter((p) => p.userId.toString() !== memberId);

  if (!conversation.removedUsers.some((rId) => rId.toString() === memberId)) {
    conversation.removedUsers.push(memberId);
  }

  const removedUser = await User.findById(memberId).select("displayName");
  const removedName = removedUser ? removedUser.displayName : "Thành viên";

  const content =
    memberId === userId.toString()
      ? `${removedName} đã rời khỏi nhóm.`
      : `${removerName} đã xóa ${removedName} khỏi nhóm.`;

  const systemMessage = await Message.create({
    conversationId,
    content,
    isSystem: true,
  });

  updateConversationAfterCreateMessage(conversation, systemMessage, null);
  await conversation.save();

  emitNewMessage(io, conversation, systemMessage);
  await populateConversationDetails(conversation);

  const formatted = formatConversation(conversation, userId);

  emitToUser(memberId, "group-updated", { conversation: formatted });
  io.to(conversationId).emit("group-updated", { conversation: formatted });

  return { conversation: formatted };
};

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find({ "participants.userId": userId }, { _id: 1 });
    return conversations.map((c) => c._id.toString());
  } catch (error) {
    return [];
  }
};

export const getConversationIdForSocketIO = async (userId) => {
  const conversations = await Conversation.find({ "participants.userId": userId }, { _id: 1 });
  return conversations.map((c) => c._id.toString());
};

export const findDirectConversation = async (userId1, userId2) => {
  return await Conversation.findOne({
    type: "direct",
    "participants.userId": {
      $all: [userId1, userId2],
    },
  });
};