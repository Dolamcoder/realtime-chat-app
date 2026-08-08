import { User } from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { uploadToStorage } from "./storageService.js";
import { hashPassword, checkPassword } from "./authService.js";
import { createAndSendChangePasswordOtp, verifyOtpCode } from "./otpService.js";
import { sendPasswordChangedEmail } from "./emailService.js";

export const createUser = async (userData) => {
  const newUser = new User(userData);
  return await newUser.save();
};

export const getUserByUsername = async (username) => {
  const user = await User.findOne({ username: username.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(404, "Username không tồn tại");
  }
  return user;
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-hashedPassword").lean();
  if (!user) {
    throw new ApiError(404, "Không tìm thấy người dùng");
  }
  return user;
};

export const queryUsers = async (queryStr, currentUserId) => {
  if (!queryStr || queryStr.trim() === "") {
    return [];
  }
  return await User.find({
    _id: { $ne: currentUserId },
    $or: [
      { displayName: { $regex: queryStr, $options: "i" } },
      { username: { $regex: queryStr, $options: "i" } }
    ]
  })
    .select("_id displayName username avatarUrl")
    .limit(20)
    .lean();
};

export const updateProfileService = async (userId, { displayName, bio, phone }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Không tìm thấy người dùng");
  }

  user.displayName = displayName.trim();
  user.bio = bio ? bio.trim() : "";
  user.phone = phone ? phone.trim() : "";

  await user.save();

  const userObj = user.toObject();
  delete userObj.hashedPassword;
  return { message: "Cập nhật thông tin cá nhân thành công", user: userObj };
};

export const updateAvatarService = async (userId, file) => {
  if (!file) {
    throw new ApiError(400, "Vui lòng chọn ảnh đại diện");
  }

  const avatarUrl = await uploadToStorage(file);
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Không tìm thấy người dùng");
  }

  user.avatarUrl = avatarUrl;
  await user.save();

  const userObj = user.toObject();
  delete userObj.hashedPassword;
  return { message: "Cập nhật ảnh đại diện thành công", user: userObj };
};

export const sendChangePasswordOtpService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Không tìm thấy người dùng");
  }

  await createAndSendChangePasswordOtp(user);
  return { message: "Mã OTP xác thực thay đổi mật khẩu đã được gửi đến email của bạn." };
};

export const changePasswordWithOtpService = async (userId, { oldPassword, newPassword, otp }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Không tìm thấy người dùng");
  }

  await checkPassword(oldPassword, user.hashedPassword);

  verifyOtpCode(user.changePasswordOtp, user.changePasswordOtpExpires, otp);

  user.hashedPassword = await hashPassword(newPassword);
  user.changePasswordOtp = undefined;
  user.changePasswordOtpExpires = undefined;
  await user.save();

  await sendPasswordChangedEmail(user.email, user.displayName);

  return { message: "Đổi mật khẩu thành công." };
};
