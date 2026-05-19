import { User } from "../models/User.js";
import ApiError from "../utils/ApiError.js";

export const createUser = async (userData) => {
  try {
    const newUser = new User(userData);
    await newUser.save();
  } catch (e) {
    throw e;
  }
};

export const getUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new ApiError(404, "Username không tồn tại");
    }
    return user;
  } catch (e) {
    throw e;
  }
};
export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select("-hashedPassword").lean();
    if (!user) {
      throw new ApiError(404, "Không tìm thấy người dùng");
    }
    return user;
  } catch (e) {
    throw e;
  }
};
