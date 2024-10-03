import { isValidObjectId } from "mongoose";
import { getEnv } from "../configs/config.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomError } from "../utils/customError.js";
import { sendToken } from "../services/auth/sendToken.js";
import { Auth } from "../models/auth.model.js";
import { JWTService } from "../services/auth/jwtService.js";
import bcrypt from "bcrypt";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// register
// ---------
const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const image = req?.file;
  if (!firstName || !lastName || !email || !password || !image) {
    return next(new CustomError(400, "Please Provide all fields"));
  }
  const user = await Auth.findOne({ email });
  if (user && user?._id) return next(new CustomError(403, "Email Already Exists"));

  const myCloud = await uploadOnCloudinary(image, "auth");
  if (!myCloud?.public_id || !myCloud?.secure_url) {
    return next(new CustomError(400, "Error While Uploading User Image on Cloudinary"));
  }
  const newUser = await Auth.create({
    firstName,
    lastName,
    email,
    password,
    image: {
      public_id: myCloud?.public_id,
      url: myCloud?.secure_url,
    },
  });
  if (!newUser) return next(new CustomError(400, "Error While Registering User"));
  await sendToken(res, next, newUser, 201, "Your Account Registered Successfully");
});

// login
// ------
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new CustomError(400, "Please Provide Email and Password"));
  const user = await Auth.findOne({ email }).select("+password");
  if (!user && !user?._id) return next(new CustomError(400, "Wrong username or password"));
  // compare password
  const matchPwd = await bcrypt.compare(password, user.password);
  if (!matchPwd) return next(new CustomError(400, "Wrong username or password"));
  // make and store access and refresh token in cookies
  await sendToken(res, next, user, 200, "Logged In Successfully");
});

// logout
// ---------
const logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req?.cookies?.[getEnv("REFRESH_TOKEN_NAME")];
  if (refreshToken) await JWTService().removeRefreshToken(refreshToken);
  res.cookie(getEnv("ACCESS_TOKEN_NAME"), "", { maxAge: 1 });
  res.cookie(getEnv("REFRESH_TOKEN_NAME"), "", { maxAge: 1 });
  return res.status(200).json({ success: true, message: "Logged Out Successfully" });
});

// get My Profile
// ---------------
const getMyProfile = asyncHandler(async (req, res, next) => {
  const userId = req?.user?._id;
  if (!isValidObjectId(userId)) return next(new CustomError(400, "Invalid User Id"));
  const user = await Auth.findById(userId);
  if (!user) return next(new CustomError(400, "User Not Found"));
  return res.status(200).json({ success: true, data: user });
});

export { register, login, logout, getMyProfile };
