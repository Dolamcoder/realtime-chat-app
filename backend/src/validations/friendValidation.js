import Joi from "joi";

export const friendValidation = {
  sendFriendRequest: Joi.object({
    to: Joi.string().required().messages({
      "string.empty": "Vui lòng chỉ định người nhận lời mời kết bạn",
      "any.required": "Vui lòng chỉ định người nhận lời mời kết bạn",
    }),
    message: Joi.string().allow("").max(200).messages({
      "string.max": "Tin nhắn đính kèm không vượt quá 200 ký tự",
    }),
  }),
};
