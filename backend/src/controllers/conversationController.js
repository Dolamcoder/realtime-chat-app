import { createGroupContversation, createDirectConversation, getConversationByUserId, updateMarkAsSeen, getConversationById } from "../services/conversationService.js";
import { getMessagesPage } from "../services/messageService.js";
import { asyncHandler } from '../utils/asyncHandle.js';
import { readMessage } from "../socket/messageSocket.js";
import { io, emitToUser } from "../socket/index.js";
import { emitNewMessage } from "../socket/messageSocket.js";
import Message from "../models/Message.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";
import { User } from "../models/User.js";
export const createConversation = asyncHandler(async (req, res) => {
  const { name, memberIds } = req.body;
  const userId = req.user._id;
  let conversation;

  if (!name && memberIds && memberIds.length === 1) {
    const recipientId = memberIds[0];
    conversation = await getConversationByUserId(userId);
    const existing = conversation.find(c => c.type === "direct" && c.participants.some(p => p.userId?._id.toString() === recipientId));
    if (existing) {
      return res.status(200).json({ conversation: existing });
    }
    // create a new direct conversation
    conversation = await createDirectConversation(userId, recipientId);
  } else {
    conversation = await createGroupContversation(userId, memberIds, name);
  }

  await conversation.populate([
    { path: "participants.userId", select: "displayName avatarUrl" },
    {
      path: "seenBy",
      select: "displayName avatarUrl",
    },
    { path: "lastMessage.senderId", select: "displayName avatarUrl" },
  ]);
  const participants = (conversation.participants || []).map((p) => ({
    _id: p.userId?._id,
    displayName: p.userId?.displayName,
    avatarUrl: p.userId?.avatarUrl ?? null,
    joinedAt: p.joinedAt,
    clearedAt: p.clearedAt ?? null,
  }));

  const myParticipant = conversation.participants.find(p => p.userId?._id.toString() === userId.toString());
  const myClearedAt = myParticipant?.clearedAt;

  let lastMessage = conversation.lastMessage ? conversation.lastMessage.toObject() : null;
  if (lastMessage && myClearedAt && new Date(lastMessage.createdAt) <= new Date(myClearedAt)) {
    lastMessage = {
      ...lastMessage,
      content: "Dữ liệu cũ đã bị xóa",
    };
  }

  const formatted = { ...conversation.toObject(), participants, lastMessage };

  // Notify all participants so they can join the new socket room
  const conversationId = conversation._id.toString();
  participants.forEach((p) => {
    if (p._id) {
      emitToUser(p._id.toString(), "new-conversation", { conversation: formatted, conversationId });
    }
  });

  return res.status(201).json({ conversation: formatted });
});


export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const conversations = await getConversationByUserId(userId);
  const formatted = conversations.map((convo) => {
    const participants = (convo.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
      clearedAt: p.clearedAt ?? null,
    }));

    const myParticipant = convo.participants.find(p => p.userId?._id.toString() === userId.toString());
    const myClearedAt = myParticipant?.clearedAt;

    let lastMessage = convo.lastMessage ? convo.lastMessage.toObject() : null;
    if (lastMessage && myClearedAt && new Date(lastMessage.createdAt) <= new Date(myClearedAt)) {
      lastMessage = {
        ...lastMessage,
        content: "Dữ liệu cũ đã bị xóa",
      };
    }

    return {
      ...convo.toObject(),
      unreadCounts: convo.unreadCounts || {},
      participants,
      lastMessage,
    };
  });
  return res.status(200).json({ conversations: formatted });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { limit = 50, cursor } = req.query;
  const userId = req.user._id;

  const conversation = await getConversationById(conversationId);
  const myParticipant = conversation.participants.find(p => p.userId.toString() === userId.toString());
  const myClearedAt = myParticipant?.clearedAt;

  const query = { conversationId };
  if (myClearedAt) {
    query.createdAt = { $gt: new Date(myClearedAt) };
  }

  if (cursor) {
    const cursorDate = new Date(cursor);
    if (myClearedAt && cursorDate <= new Date(myClearedAt)) {
      return res.status(200).json({
        messages: [],
        nextCursor: null,
      });
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
  return res.status(200).json({
    messages,
    nextCursor,
  });
});

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await getConversationById(conversationId);

    const last = conversation.lastMessage;
    if (!last) {
      return res
        .status(200)
        .json({ message: "Không có tin nhắn để mark as seen" });
    }

    if (last.senderId.toString() === userId) {
      return res.status(200).json({ message: "Sender không cần mark as seen" });
    }

    const updated = await updateMarkAsSeen(conversationId, userId)
    await updated.populate([
      { path: "participants.userId", select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
      { path: "seenBy", select: "displayName avatarUrl" }
    ]);

    const formatted = {
      ...updated.toObject(),
      unreadCounts: updated.unreadCounts || {},
      participants: (updated.participants || []).map((p) => ({
        _id: p.userId?._id || p.userId,
        displayName: p.userId?.displayName || "",
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      })),
    };

    await readMessage(io, formatted);
    return res.status(200).json({
      message: "Marked as seen",
      seenBy: formatted.seenBy || [],
      myUnreadCount: formatted.unreadCounts[userId] || 0,
    });
  } catch (error) {
    console.error("Lỗi khi mark as seen", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const clearConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id.toString();

  const conversation = await getConversationById(conversationId);
  
  // Cập nhật clearedAt của participant tương ứng với user hiện tại
  const participant = conversation.participants.find(p => p.userId.toString() === userId);
  if (!participant) {
    return res.status(403).json({ message: "Bạn không tham gia cuộc trò chuyện này" });
  }
  
  participant.clearedAt = new Date();
  await conversation.save();

  return res.status(200).json({ message: "Xóa lịch sử trò chuyện thành công", clearedAt: participant.clearedAt });
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id.toString();

  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
  }

  if (conversation.type !== "group") {
    return res.status(400).json({ message: "Cuộc trò chuyện này không phải là nhóm" });
  }

  const creatorId = conversation.group?.createdBy?.toString() || conversation.group?.createBy?.toString();
  if (creatorId !== userId) {
    return res.status(403).json({ message: "Chỉ trưởng nhóm mới có quyền xóa nhóm" });
  }

  // Đánh dấu nhóm đã bị xóa thay vì xóa hoàn toàn
  conversation.isDeleted = true;
  await conversation.save();

  // Gửi thông báo qua socket cho cả phòng conversationId
  io.to(conversationId).emit("group-deleted", { conversationId });

  return res.status(200).json({ message: "Xóa nhóm thành công", conversationId });
});

export const addMembers = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { memberIds } = req.body;
  const userId = req.user._id.toString();

  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
  }

  if (conversation.type !== "group") {
    return res.status(400).json({ message: "Cuộc trò chuyện này không phải là nhóm" });
  }

  const existingMemberIds = conversation.participants.map(p => p.userId.toString());
  const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id));

  if (newMemberIds.length === 0) {
    return res.status(400).json({ message: "Các thành viên đều đã có trong nhóm" });
  }

  newMemberIds.forEach(id => {
    conversation.participants.push({ userId: id, joinAt: new Date() });
    // Nếu họ từng bị xóa, loại họ ra khỏi danh sách removedUsers
    conversation.removedUsers = conversation.removedUsers.filter(rId => rId.toString() !== id);
  });

  // Tạo tin nhắn hệ thống thông báo thêm thành viên
  const adderName = req.user.displayName;
  const addedUsers = await User.find({ _id: { $in: newMemberIds } }).select("displayName");
  const addedNames = addedUsers.map(u => u.displayName).join(", ");
  const content = `${adderName} đã thêm ${addedNames} vào nhóm.`;

  const systemMessage = await Message.create({
    conversationId,
    content,
    isSystem: true
  });

  updateConversationAfterCreateMessage(conversation, systemMessage, null);
  await conversation.save();

  // Phát tin nhắn hệ thống realtime cho cả nhóm
  emitNewMessage(io, conversation, systemMessage);

  await conversation.populate([
    { path: "participants.userId", select: "displayName avatarUrl" },
    { path: "lastMessage.senderId", select: "displayName avatarUrl" },
  ]);

  const participants = (conversation.participants || []).map((p) => ({
    _id: p.userId?._id || p.userId,
    displayName: p.userId?.displayName || "",
    avatarUrl: p.userId?.avatarUrl ?? null,
    joinedAt: p.joinedAt,
    clearedAt: p.clearedAt ?? null,
  }));

  const lastMessage = conversation.lastMessage ? conversation.lastMessage.toObject() : null;
  const formatted = { ...conversation.toObject(), participants, lastMessage };

  newMemberIds.forEach(id => {
    emitToUser(id, "new-conversation", { conversation: formatted, conversationId });
  });

  io.to(conversationId).emit("group-updated", { conversation: formatted });

  return res.status(200).json({ conversation: formatted });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { conversationId, memberId } = req.params;
  const userId = req.user._id.toString();

  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
  }

  if (conversation.type !== "group") {
    return res.status(400).json({ message: "Cuộc trò chuyện này không phải là nhóm" });
  }

  const creatorId = conversation.group?.createdBy?.toString() || conversation.group?.createBy?.toString();
  if (creatorId !== userId && userId !== memberId) {
    return res.status(403).json({ message: "Chỉ trưởng nhóm mới có quyền xóa thành viên" });
  }

  conversation.participants = conversation.participants.filter(p => p.userId.toString() !== memberId);
  
  // Đẩy thành viên bị xóa vào danh sách removedUsers nếu chưa có
  if (!conversation.removedUsers.some(rId => rId.toString() === memberId)) {
    conversation.removedUsers.push(memberId);
  }

  // Tạo tin nhắn hệ thống thông báo xóa thành viên hoặc thành viên rời nhóm
  const removerName = req.user.displayName;
  const removedUser = await User.findById(memberId).select("displayName");
  const removedName = removedUser ? removedUser.displayName : "Thành viên";
  
  const content = memberId === userId
    ? `${removedName} đã rời khỏi nhóm.`
    : `${removerName} đã xóa ${removedName} khỏi nhóm.`;

  const systemMessage = await Message.create({
    conversationId,
    content,
    isSystem: true
  });

  updateConversationAfterCreateMessage(conversation, systemMessage, null);
  await conversation.save();

  // Phát tin nhắn hệ thống realtime cho cả nhóm
  emitNewMessage(io, conversation, systemMessage);

  await conversation.populate([
    { path: "participants.userId", select: "displayName avatarUrl" },
    { path: "lastMessage.senderId", select: "displayName avatarUrl" },
  ]);

  const participants = (conversation.participants || []).map((p) => ({
    _id: p.userId?._id || p.userId,
    displayName: p.userId?.displayName || "",
    avatarUrl: p.userId?.avatarUrl ?? null,
    joinedAt: p.joinedAt,
    clearedAt: p.clearedAt ?? null,
  }));

  const lastMessage = conversation.lastMessage ? conversation.lastMessage.toObject() : null;
  const formatted = { ...conversation.toObject(), participants, lastMessage };

  // Phát tín hiệu cập nhật cho người dùng vừa bị xóa
  emitToUser(memberId, "group-updated", { conversation: formatted });

  // Phát tín hiệu cập nhật nhóm cho những người còn lại
  io.to(conversationId).emit("group-updated", { conversation: formatted });

  return res.status(200).json({ conversation: formatted });
});