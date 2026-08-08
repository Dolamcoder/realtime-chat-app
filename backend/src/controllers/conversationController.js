import { asyncHandler } from "../utils/asyncHandle.js";
import {
  createConversationService,
  getConversationsService,
  getMessagesService,
  markAsSeenService,
  clearConversationService,
  deleteGroupService,
  addMembersService,
  removeMemberService,
} from "../services/conversationService.js";

export const createConversation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await createConversationService(userId, req.body);
  return res.status(201).json(result);
});

export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await getConversationsService(userId);
  return res.status(200).json(result);
});

export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const result = await getMessagesService(userId, conversationId, req.query);
  return res.status(200).json(result);
});

export const markAsSeen = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const result = await markAsSeenService(userId, conversationId);
  return res.status(200).json(result);
});

export const clearConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const result = await clearConversationService(userId, conversationId);
  return res.status(200).json(result);
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const result = await deleteGroupService(userId, conversationId);
  return res.status(200).json(result);
});

export const addMembers = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { memberIds } = req.body;
  const userId = req.user._id;
  const adderName = req.user.displayName;
  const result = await addMembersService(userId, conversationId, memberIds, adderName);
  return res.status(200).json(result);
});

export const removeMember = asyncHandler(async (req, res) => {
  const { conversationId, memberId } = req.params;
  const userId = req.user._id;
  const removerName = req.user.displayName;
  const result = await removeMemberService(userId, conversationId, memberId, removerName);
  return res.status(200).json(result);
});