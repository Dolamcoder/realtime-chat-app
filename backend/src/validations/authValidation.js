import Joi from "joi";

export const authValidation = {
  register: Joi.object({
    username: Joi.string().min(6).trim().required().messages({
      "string.empty": "Tên đăng nhập không được để trống",
      "string.min": "Tên đăng nhập phải có ít nhất 6 ký tự",
      "any.required": "Vui lòng nhập tên đăng nhập",
    }),
    email: Joi.string().email().trim().required().messages({
      "string.empty": "Email không được để trống",
      "string.email": "Địa chỉ Email không đúng định dạng",
      "any.required": "Vui lòng nhập địa chỉ Email",
    }),
    password: Joi.string().min(8).required().messages({
      "string.empty": "Mật khẩu không được để trống",
      "string.min": "Mật khẩu phải có ít nhất 8 ký tự",
      "any.required": "Vui lòng nhập mật khẩu",
    }),
    firstname: Joi.string().trim().required().messages({
      "string.empty": "Tên không được để trống",
      "any.required": "Vui lòng nhập tên",
    }),
    lastname: Joi.string().trim().required().messages({
      "string.empty": "Họ không được để trống",
      "any.required": "Vui lòng nhập họ",
    }),
  }),

  verifyEmail: Joi.object({
    email: Joi.string().email().trim().required().messages({
      "string.empty": "Email không được để trống",
      "string.email": "Địa chỉ Email không hợp lệ",
      "any.required": "Vui lòng nhập địa chỉ Email",
    }),
    otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      "string.empty": "Mã OTP không được để trống",
      "string.length": "Mã OTP phải đúng 6 chữ số",
      "string.pattern.base": "Mã OTP chỉ được chứa chữ số",
      "any.required": "Vui lòng nhập mã OTP",
    }),
  }),

  resendVerification: Joi.object({
    email: Joi.string().email().trim().required().messages({
      "string.empty": "Email không được để trống",
      "string.email": "Địa chỉ Email không hợp lệ",
      "any.required": "Vui lòng nhập địa chỉ Email",
    }),
  }),

  login: Joi.object({
    username: Joi.string().min(6).trim().required().messages({
      "string.empty": "Tên đăng nhập không được để trống",
      "string.min": "Tên đăng nhập phải có ít nhất 6 ký tự",
      "any.required": "Vui lòng nhập tên đăng nhập",
    }),
    password: Joi.string().min(8).required().messages({
      "string.empty": "Mật khẩu không được để trống",
      "string.min": "Mật khẩu phải có ít nhất 8 ký tự",
      "any.required": "Vui lòng nhập mật khẩu",
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().trim().required().messages({
      "string.empty": "Email không được để trống",
      "string.email": "Địa chỉ Email không hợp lệ",
      "any.required": "Vui lòng nhập địa chỉ Email",
    }),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().trim().required().messages({
      "string.empty": "Email không được để trống",
      "string.email": "Địa chỉ Email không hợp lệ",
      "any.required": "Vui lòng nhập địa chỉ Email",
    }),
    otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      "string.empty": "Mã OTP không được để trống",
      "string.length": "Mã OTP phải đúng 6 chữ số",
      "string.pattern.base": "Mã OTP chỉ được chứa chữ số",
      "any.required": "Vui lòng nhập mã OTP",
    }),
    newPassword: Joi.string().min(8).required().messages({
      "string.empty": "Mật khẩu mới không được để trống",
      "string.min": "Mật khẩu mới phải có ít nhất 8 ký tự",
      "any.required": "Vui lòng nhập mật khẩu mới",
    }),
  }),
};
