import ApiError from "../utils/ApiError.js";
import {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendChangePasswordOtpEmail,
} from "./emailService.js";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOtpExpiry = (minutes = 15) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

export const createAndSendVerificationOtp = async (user) => {
  const otp = generateOtp();
  user.verificationOtp = otp;
  user.verificationOtpExpires = getOtpExpiry(15);
  await user.save();
  await sendVerificationEmail(user.email, otp);
  return otp;
};

export const createAndSendResetPasswordOtp = async (user) => {
  const otp = generateOtp();
  user.resetPasswordOtp = otp;
  user.resetPasswordOtpExpires = getOtpExpiry(15);
  await user.save();
  await sendForgotPasswordEmail(user.email, otp);
  return otp;
};

export const createAndSendChangePasswordOtp = async (user) => {
  const otp = generateOtp();
  user.changePasswordOtp = otp;
  user.changePasswordOtpExpires = getOtpExpiry(15);
  await user.save();
  await sendChangePasswordOtpEmail(user.email, otp, user.displayName);
  return otp;
};

export const verifyOtpCode = (savedOtp, savedExpires, inputOtp) => {
  if (!savedOtp || savedOtp.trim() !== inputOtp.trim()) {
    throw new ApiError(400, "Mã OTP không chính xác");
  }

  if (!savedExpires || new Date() > new Date(savedExpires)) {
    throw new ApiError(400, "Mã OTP đã hết hạn. Vui lòng lấy mã mới");
  }

  return true;
};
