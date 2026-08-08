import { asyncHandler } from "../utils/asyncHandle.js";
import {
  queryUsers,
  updateProfileService,
  updateAvatarService,
  sendChangePasswordOtpService,
  changePasswordWithOtpService,
} from "../services/userService.js";

export const authMe = asyncHandler(async (req, res) => {
  return res.status(200).json({ user: req.user });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const currentUserId = req.user._id;
  const users = await queryUsers(q, currentUserId);
  return res.status(200).json({ users });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await updateProfileService(userId, req.body);
  return res.status(200).json(result);
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await updateAvatarService(userId, req.file);
  return res.status(200).json(result);
});

export const requestChangePasswordOtp = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await sendChangePasswordOtpService(userId);
  return res.status(200).json(result);
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await changePasswordWithOtpService(userId, req.body);
  return res.status(200).json(result);
});