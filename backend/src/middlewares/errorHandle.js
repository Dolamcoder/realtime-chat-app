export const errorHandler = (err, req, res, next) => {
  if (!err.statusCode) err.statusCode = 500;
  const responseError = {
    statusCode: err.statusCode,
    message: err.message || "Lỗi từ server", // Nếu lỗi mà không có message thì lấy ReasonPhrases chuẩn theo mã Status Code
  };
  console.error(err.stack);
  res.status(err.statusCode).json(responseError);
};