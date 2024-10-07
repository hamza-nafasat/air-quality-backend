import { isValidObjectId } from "mongoose";
import { Building } from "../models/building.model.js";
import { Floor } from "../models/floor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { CustomError } from "../utils/customError.js";

// create building
// ---------------
const createBuilding = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { name, type, area, address, position } = req.body;
  const files = req.files;
  // validation
  if (!name || !type || !area || !address || !position || !files)
    return next(new CustomError(400, "Please Provide all fields"));
  if (!files["thumbnail"] || !files["2dModel"])
    return next(new CustomError(400, "Please Add thumbnail and 2DModel both"));
  // upload images on cloudinary
  const thumbnailImage = files["thumbnail"][0];
  const twoDModelImage = files["2dModel"][0];
  const thumbnailCloudPromise = uploadOnCloudinary(thumbnailImage, "buildings");
  const twoDModelCloudPromise = uploadOnCloudinary(twoDModelImage, "buildings");
  const [thumbnailCloud, twoDModelCloud] = await Promise.all([
    thumbnailCloudPromise,
    twoDModelCloudPromise,
  ]);

  const building = await Building.create({
    name,
    type,
    area,
    address,
    position,
    thumbnail: thumbnailCloud,
    twoDModel: twoDModelCloud,
    ownerId,
  });
  if (!building?._id) return next(new CustomError(400, "Error While Creating Building"));
  return res
    .status(201)
    .json({ success: true, buildingId: building?._id, message: "Building Created Successfully" });
});

// get single building
// -------------------
const getSingleBuilding = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { buildingId } = req.params;
  if (!isValidObjectId(buildingId)) return next(new CustomError(400, "Invalid Building Id"));
  const building = await Building.findOne({ _id: buildingId, ownerId }).populate("floors");
  if (!building) return next(new CustomError(400, "Building Not Found"));
  return res.status(200).json({ success: true, data: building });
});

// update single building
// ----------------------
const updateSingleBuilding = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { buildingId } = req.params;
  if (!isValidObjectId(buildingId)) return next(new CustomError(400, "Invalid Building Id"));
  let { name, type, area, address, position, floors } = req.body;
  floors = floors?.split(",");
  const files = req.files;
  if (!name && !type && !area && !address && !position && !files && !floors)
    return next(new CustomError(400, "Please Provide at least one field"));
  const building = await Building.findOne({ _id: buildingId, ownerId });
  if (!building) return next(new CustomError(400, "Building Not Found"));
  if (name) building.name = name;
  if (type) building.type = type;
  if (area) building.area = area;
  if (address) building.address = address;
  if (position) building.position = position;
  if (files?.["thumbnail"] && building?.thumbnail?.public_id) {
    const thumbnailImage = files["thumbnail"][0];
    const [_, myCloud] = await Promise.all([
      removeFromCloudinary(building?.thumbnail?.public_id),
      uploadOnCloudinary(thumbnailImage, "buildings"),
    ]);
    if (!myCloud?.public_id || !myCloud?.secure_url)
      return next(new CustomError(400, "Error While Uploading User Image on Cloudinary"));
    building.thumbnail = myCloud;
  }
  if (files?.["2dModel"] && building?.twoDModel?.public_id) {
    const twoDModelImage = files["2dModel"][0];
    const [_, myCloud] = await Promise.all([
      removeFromCloudinary(building?.twoDModel?.public_id),
      uploadOnCloudinary(twoDModelImage, "buildings"),
    ]);
    if (!myCloud?.public_id || !myCloud?.secure_url)
      return next(new CustomError(400, "Error While Uploading User Image on Cloudinary"));
    building.twoDModel = myCloud;
  }
  if (floors?.length) {
    const updatedFloors = [...new Set(floors)];
    const floorPromises = [];
    const validFloorIds = [];
    updatedFloors.forEach((floorId) => {
      if (isValidObjectId(floorId)) {
        floorPromises.push(Floor.findById(floorId));
        validFloorIds.push(floorId);
        // console.log("invalid floor id", floorId);
        // return next(new CustomError(400, "Invalid Floor Id"));
      }
    });
    const floorExist = await Promise.all(floorPromises);
    if (floorExist.includes(null)) return next(new CustomError(400, "Some Floors aren't added correctly"));
    building.floors = validFloorIds;
  }
  await building.save();
  return res.status(200).json({ success: true, message: "Building Updated Successfully" });
});

// delete single building
// ----------------------
const deleteSingleBuilding = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { buildingId } = req.params;
  if (!isValidObjectId(buildingId)) return next(new CustomError(400, "Invalid Building Id"));
  const building = await Building.findOne({ _id: buildingId, ownerId });
  if (!building) return next(new CustomError(400, "Building Not Found"));
  if (building?.thumbnail?.public_id) await removeFromCloudinary(building?.thumbnail?.public_id);
  if (building?.twoDModel?.public_id) await removeFromCloudinary(building?.twoDModel?.public_id);
  await building.deleteOne();
  return res.status(200).json({ success: true, message: "Building Deleted Successfully" });
});

// get all buildings
// ------------------
const getAllBuildings = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const buildings = await Building.find({ ownerId }).populate("floors").populate({
    path: "floors.sensors",
  });
  if (!buildings) return next(new CustomError(400, "Buildings Not Found"));
  return res.status(200).json({ success: true, data: buildings });
});

export { createBuilding, getSingleBuilding, getAllBuildings, updateSingleBuilding, deleteSingleBuilding };
