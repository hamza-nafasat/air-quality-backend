import { getEnv } from "../configs/config.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomError } from "../utils/customError.js";
import { Auth } from "../models/auth.model.js";
import { JWTService } from "../services/auth/jwtService.js";

// auth middleware
// ---------------
const isAuthenticated = asyncHandler(async (req, res, next) => {
  try {
    const accessToken = req?.cookies?.[getEnv("ACCESS_TOKEN_NAME")];
    const refreshToken = req.cookies?.[getEnv("REFRESH_TOKEN_NAME")];
    if (!accessToken || !refreshToken) return next(new CustomError(401, "Please Login First"));
    const decoded = await JWTService().verifyAccessToken(accessToken);
    if (!decoded) return next(new CustomError(401, "Please Login First"));
    const user = await Auth.findById(decoded?._id);
    if (!user) return next(new CustomError(401, "Please Login First"));
    req.user = user;
    return next();
  } catch (error) {
    // console.log("Error in isAuthenticated:", error);
    return next(new CustomError(401, "Please Login First"));
  }
});

export { isAuthenticated };
