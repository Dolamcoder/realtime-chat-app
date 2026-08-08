import ApiError from "../utils/ApiError.js";

export const validate = (schemaObj) => async (req, res, next) => {
  try {
    const options = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: false,
    };

    if (schemaObj.isJoi) {
      await schemaObj.validateAsync(req.body, options);
    } else {
      if (schemaObj.body) {
        await schemaObj.body.validateAsync(req.body, options);
      }
      if (schemaObj.params) {
        await schemaObj.params.validateAsync(req.params, options);
      }
      if (schemaObj.query) {
        await schemaObj.query.validateAsync(req.query, options);
      }
    }

    next();
  } catch (error) {
    const errorMessage = error.details
      ? error.details.map((detail) => detail.message.replace(/"/g, "")).join(", ")
      : error.message;
    next(new ApiError(400, errorMessage));
  }
};
