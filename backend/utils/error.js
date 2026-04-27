const sendError = (res, options) => {
 const {
  status = 500,
  message = "Something went wrong",
  error = null,
  code = "INTERNAL_ERROR"
 } = options || {};

 if (error) {
  console.error(message, error);
 }

 return res.status(status).json({
  message,
  code,
  details: process.env.NODE_ENV === "development" && error ? error.message : undefined
 });
};

module.exports = {
 sendError
};