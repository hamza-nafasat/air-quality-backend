import { isValidObjectId } from "mongoose";
import { Building } from "../models/building.model.js";
import { Floor } from "../models/floor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { CustomError } from "../utils/customError.js";
import { Sensor } from "../models/sensor.model.js";

// create floor
// ---------------
const createFloor = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  let { name, rooms, sensors, buildingId } = req.body;
  console.log("rea.body of floor", req.body);
  const file = req.file;
  // validation
  if (!name || !rooms || !file) return next(new CustomError(400, "Please Provide all fields"));
  sensors = sensors?.split(",");
  // console.log("sesnors ", sensors);
  if (!Array.isArray(sensors)) return next(new CustomError(400, "Sensors must be an Array of ObjectIds"));
  if (!isValidObjectId(buildingId)) return next(new CustomError(400, "Invalid Building Id"));
  const sensorsPromises = [];
  const sensorsSet = new Set();
  sensors?.forEach((element) => {
    if (element) {
      if (!isValidObjectId(element)) return next(new CustomError(400, "Sensors must be an Array of Ids"));
      sensorsPromises.push(Sensor.findByIdAndUpdate(element, { isConnected: true }, { new: true }));
      sensorsSet.add(element);
    }
  });
  const sensorsExist = await Promise.all(sensorsPromises);
  if (sensorsExist.includes(null)) return next(new CustomError(400, "Some Sensors aren't added correctly"));
  // upload images on cloudinary

  const myCloud = await uploadOnCloudinary(file, "floors");
  if (!myCloud?.public_id || !myCloud?.secure_url)
    return next(new CustomError(400, "Error While Uploading User Image on Cloudinary"));

  const floor = await Floor.create({
    name,
    rooms,
    buildingId,
    sensors: [...sensorsSet],
    ownerId,
    twoDModel: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  res.status(201).json({
    success: true,
    data: floor,
  });
});

// get all floors
// ---------------
const getAllFloorsOfBuilding = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { buildingId } = req.query;
  if (!isValidObjectId(buildingId)) return next(new CustomError(400, "Invalid Building Id"));
  const building = await Building.findOne({ _id: buildingId, ownerId });
  if (!building) return next(new CustomError(400, "Building Not Found"));
  const floors = await Floor.find({ ownerId, buildingId });
  if (!floors) return next(new CustomError(400, "Floors Not Found"));
  return res.status(200).json({ success: true, data: floors });
});

// get single floor
// ----------------
const getSingleFloor = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { floorId } = req.params;
  if (!isValidObjectId(floorId)) return next(new CustomError(400, "Invalid Floor Id"));
  const floor = await Floor.findOne({ _id: floorId, ownerId });
  if (!floor) return next(new CustomError(400, "Floor Not Found"));
  return res.status(200).json({ success: true, data: floor });
});

// delete single floor
// -------------------
const deleteSingleFloor = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { floorId } = req.params;
  if (!isValidObjectId(floorId)) return next(new CustomError(400, "Invalid Floor Id"));
  const floor = await Floor.findOneAndDelete({ _id: floorId, ownerId });
  if (!floor) return next(new CustomError(400, "Floor Not Found"));
  return res.status(200).json({ success: true, message: "Floor Deleted Successfully" });
});

// update single floor
// -------------------
const updateSingleFloor = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { floorId } = req.params;
  if (!isValidObjectId(floorId)) return next(new CustomError(400, "Invalid Floor Id"));
  const { name, rooms, area, sensors } = req.body;
  const file = req.file;
  if (!name && !rooms && !area && !sensors && !file)
    return next(new CustomError(400, "Please Provide at least one field"));
  const floor = await Floor.findOne({ _id: floorId, ownerId });
  if (!floor) return next(new CustomError(400, "Floor Not Found"));
  if (name) floor.name = name;
  if (rooms) floor.rooms = rooms;
  if (area) floor.area = area;
  if (sensors) {
    const sensorsPromises = [];
    const sensorsSet = new Set();
    sensors?.forEach((element) => {
      if (!isValidObjectId(element)) return next(new CustomError(400, "Floors must be an Array of Ids"));
      sensorsPromises.push(Sensor.findById(element));
      sensorsSet.add(element);
    });
    const sensorsExist = await Promise.all(sensorsPromises);
    if (sensorsExist.includes(null))
      return next(new CustomError(400, "Some Sensors aren't added correctly"));
    floor.sensors = [...sensorsSet];
  }
  if (file) {
    const [removeFile, myCloud] = await Promise.all([
      removeFromCloudinary(floor.image.public_id),
      uploadOnCloudinary(file, "floors"),
    ]);
    if (!myCloud?.public_id || !myCloud?.secure_url)
      return next(new CustomError(400, "Error While Uploading User Image on Cloudinary"));
    floor.image = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  await floor.save();
  return res.status(200).json({ success: true, message: "Floor Updated Successfully" });
});

export { createFloor, getAllFloorsOfBuilding, getSingleFloor, deleteSingleFloor, updateSingleFloor };
