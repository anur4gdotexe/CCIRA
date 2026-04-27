const User = require("./auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendError } = require("../../utils/error");

const isValidEmail = (email = "") => {
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const VALID_ROLES = ["user", "admin", "officer"];

const sanitizeUser = (user) => ({
 id: user._id,
 name: user.name,
 email: user.email,
 role: user.role
});

exports.register = async (req,res)=>{

 try{

   const {name,email,password,role} = req.body;

    if (!name || !email || !password) {
     return sendError(res, {
        status: 400,
        message: "Name, email, and password are required",
        code: "AUTH_VALIDATION_ERROR"
     });
    }

    if (!isValidEmail(email)) {
     return sendError(res, {
        status: 400,
        message: "Please provide a valid email address",
        code: "AUTH_INVALID_EMAIL"
     });
    }

    if (String(password).length < 6) {
     return sendError(res, {
        status: 400,
        message: "Password must be at least 6 characters long",
        code: "AUTH_WEAK_PASSWORD"
     });
    }

      const resolvedRole = role ? String(role).toLowerCase() : "user";

      if (!VALID_ROLES.includes(resolvedRole)) {
         return sendError(res, {
            status: 400,
            message: "Role must be one of: user, admin, officer",
            code: "AUTH_INVALID_ROLE"
         });
      }

  const existingUser = await User.findOne({email});

  if(existingUser){
     return sendError(res, {
        status: 409,
        message: "An account with this email already exists",
        code: "AUTH_USER_EXISTS"
     });
  }

  const hashedPassword = await bcrypt.hash(password,10);

  const user = await User.create({
   name,
   email,
   password:hashedPassword,
   role: resolvedRole
  });

  res.json({
   message:"User registered successfully",
    user: sanitizeUser(user)
  });

 }catch(err){
  return sendError(res, {
    status: 500,
    message: "Unable to register user right now",
    code: "AUTH_REGISTER_FAILED",
    error: err
  });
 }

};

exports.login = async (req,res)=>{

 try{

  const {email,password} = req.body;

    if (!email || !password) {
     return sendError(res, {
        status: 400,
        message: "Email and password are required",
        code: "AUTH_VALIDATION_ERROR"
     });
    }

  const user = await User.findOne({email});

  if(!user){
     return sendError(res, {
        status: 401,
        message: "Invalid email or password",
        code: "AUTH_INVALID_CREDENTIALS"
     });
  }

  const isMatch = await bcrypt.compare(password,user.password);

  if(!isMatch){
    return sendError(res, {
     status: 401,
     message: "Invalid email or password",
     code: "AUTH_INVALID_CREDENTIALS"
    });
  }

  if (!process.env.JWT_SECRET) {
    return sendError(res, {
     status: 500,
     message: "Server auth configuration is incomplete",
     code: "AUTH_CONFIG_MISSING"
    });
  }

  const token = jwt.sign(
   {id:user._id, role:user.role},
   process.env.JWT_SECRET,
   {expiresIn:"7d"}
  );

  res.json({
   token,
    user: sanitizeUser(user)
  });

 }catch(err){
  return sendError(res, {
    status: 500,
    message: "Unable to sign in right now",
    code: "AUTH_LOGIN_FAILED",
    error: err
  });
 }

};