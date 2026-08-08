import Joi from "joi";

export const conversationValidation = {
  createConversation: {
    body: Joi.object({
      recipientId: Joi.string().allow("").optional(),
      isGroup: Joi.boolean().optional(),
      name: Joi.string().when("isGroup", {
        is: true,
        then: Joi.string().trim().required().messages({
          "string.empty": "Tên nhóm chat không được để trống",
          "any.required": "Vui lòng nhập tên nhóm chat",
        }),
        otherwise: Joi.string().allow("").optional(),
      }),
      memberIds: Joi.array().items(Joi.string()).when("isGroup", {
        is: true,
        then: Joi.array().min(1).required().messages({
          "array.min": "Vui lòng chọn ít nhất 1 thành viên vào nhóm",
          "any.required": "Vui lòng chọn danh sách thành viên",
        }),
        otherwise: Joi.array().optional(),
      }),
    }),
  },

  addMembers: {
    body: Joi.object({
      memberIds: Joi.array().items(Joi.string()).min(1).required().messages({
        "array.min": "Vui lòng chọn ít nhất 1 thành viên để thêm",
        "any.required": "Vui lòng chọn danh sách thành viên",
      }),
    }),
  },
};
