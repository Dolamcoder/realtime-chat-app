import Joi from "joi";

export const messageValidation = {
  sendMessage: {
    body: Joi.object({
      conversationId: Joi.string().required().messages({
        "string.empty": "Vui lòng chỉ định cuộc trò chuyện",
        "any.required": "Vui lòng chỉ định cuộc trò chuyện",
      }),
      content: Joi.string().allow("").max(5000).messages({
        "string.max": "Nội dung tin nhắn không vượt quá 5000 ký tự",
      }),
    }),
  },
};
