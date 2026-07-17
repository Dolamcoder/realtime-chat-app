import { createGroupContversation, getConversationByUserId, updateMarkAsSeen, getConversationById } from "../services/conversationService.js";
import { getMessagesPage } from "../services/messageService.js";
import { asyncHandler } from '../utils/asyncHandle.js';
import { readMessage } from "../socket/messageSocket.js";
import { io } from "../socket/index.js";
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
  }));

  const formatted = { ...conversation.toObject(), participants };
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
    }));

    return {
      ...convo.toObject(),
      unreadCounts: convo.unreadCounts || {},
      participants,
    };
  });
  return res.status(200).json({ conversations: formatted });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { limit = 50, cursor } = req.query;
  const query = { conversationId };
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }
  let messages = await getMessagesPage(query, limit);
  let nextCursor = null;
  if (messages.length > Number(limit)) {
    const nextMessage = messages[messages.length - 1];
    nextCursor = nextMessage.createdAt.toISOString();
    messages.pop();
  }
  messages = messages.reverse();
  console.log("<<<<<data be", messages);
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