import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import ApiError from "../utils/ApiError.js";
export const checkEmail = async (email) => {
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new ApiError(409, "Email đã được sử dụng");
    }
  } catch (err) {
    throw err;
  }
};
export const checkUsername = async (username) => {
  try {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new ApiError(409, "Username đã được sử dụng");
    }
  } catch (err) {
    throw err;
  }
};
export const hashPassword = async (password) => {
  try {
    if (password.length < 6) {
      throw new ApiError(400, "Password phải có ít nhất 6 ký tự");
    }
    return await bcrypt.hash(password, 10);
  } catch (err) {
    throw err;
  }
};
export const checkPassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isMatch) {
      throw new ApiError(401, "Mật khẩu không chính xác");
    }
    return true;
  } catch (err) {
    throw err;
  }
};
export const createAccessToken = (userId) => {
  try {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    return accessToken;
  } catch (err) {
    throw err;
  }
};
