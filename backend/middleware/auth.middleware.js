const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/error");

module.exports = (req,res,next)=>{

 const authHeader = req.headers.authorization;

 if(!authHeader){
    return sendError(res, {
      status: 401,
      message: "Authorization token is required",
      code: "AUTH_TOKEN_MISSING"
    });
 }

 const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

 if(!token){
   return sendError(res, {
    status: 401,
    message: "Authorization token is required",
    code: "AUTH_TOKEN_MISSING"
   });
 }

 if (!process.env.JWT_SECRET) {
   return sendError(res, {
    status: 500,
    message: "Server auth configuration is incomplete",
    code: "AUTH_CONFIG_MISSING"
   });
 }

 try{

 const decoded = jwt.verify(token,process.env.JWT_SECRET);

 req.user = decoded;

 next();

 }catch(err){
 return sendError(res, {
  status: 401,
  message: "Token is invalid or expired",
  code: "AUTH_TOKEN_INVALID",
  error: err
 });

 }

};