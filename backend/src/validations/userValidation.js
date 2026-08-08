import Joi from "joi";

export const userValidation = {
  updateProfile: Joi.object({
    displayName: Joi.string().trim().required().messages({
      "string.empty": "Tên hiển thị không được để trống",
      "any.required": "Vui lòng nhập tên hiển thị",
    }),
    bio: Joi.string().allow("").max(500).messages({
      "string.max": "Mô tả bản thân không được vượt quá 500 ký tự",
    }),
    phone: Joi.string().allow("").messages({
      "string.base": "Số điện thoại không hợp lệ",
    }),
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string().required().messages({
      "string.empty": "Mật khẩu hiện tại không được để trống",
      "any.required": "Vui lòng nhập mật khẩu hiện tại",
    }),
    newPassword: Joi.string().min(8).required().messages({
      "string.empty": "Mật khẩu mới không được để trống",
      "string.min": "Mật khẩu mới phải có ít nhất 8 ký tự",
      "any.required": "Vui lòng nhập mật khẩu mới",
    }),
    otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      "string.empty": "Mã OTP không được để trống",
      "string.length": "Mã OTP phải đúng 6 chữ số",
      "string.pattern.base": "Mã OTP chỉ được chứa chữ số",
      "any.required": "Vui lòng nhập mã OTP",
    }),
  }),
};
