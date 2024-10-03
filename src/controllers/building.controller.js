import { isValidObjectId } from "mongoose";
import { Sensor } from "../models/sensor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomError } from "../utils/customError.js";

// create building
// ---------------
const createBuilding = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { name, type, area, address, position, floors } = req.body;
  const files = req.files;
  if (!name || !type || !area || !address || !position || !floors || !files) {
    return next(new CustomError(400, "Please Provide all fields"));
  }
  const thumbnailImage = files["thumbnail"][0];
  const twoDModelImage = files["2dModel"][0];
  if (!thumbnailImage || !twoDModelImage)
    return next(new CustomError(400, "Please Add thumbnail and 2DModel both"));
});
