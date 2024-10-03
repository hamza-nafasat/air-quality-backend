import { isValidObjectId } from "mongoose";
import { Sensor } from "../models/sensor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomError } from "../utils/customError.js";

// create sensor
// -------------
const createSensor = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { name, type, uniqueId } = req.body;
  if (!name || !type || !uniqueId) return next(new CustomError(400, "Please Provide all fields"));
  const isExist = await Sensor.findOne({ uniqueId });
  if (isExist) return next(new CustomError(400, "Unique id already exists"));
  const sensor = await Sensor.create({ name, type, uniqueId, ownerId });
  if (!sensor?._id) return next(new CustomError(400, "Error While Creating Sensor"));
  return res.status(201).json({ success: true, message: "Sensor Created Successfully" });
});

// get all sensors
// ----------------
const getAllSensors = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const sensors = await Sensor.find({ ownerId });
  if (!sensors) return next(new CustomError(400, "Sensors Not Found"));
  return res.status(200).json({ success: true, data: sensors });
});

// get single sensor
// ----------------
const getSingleSensor = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { sensorId } = req.params;
  if (!isValidObjectId(sensorId)) return next(new CustomError(400, "Invalid Sensor Id"));
  const sensor = await Sensor.findOne({ _id: sensorId, ownerId });
  if (!sensor) return next(new CustomError(400, "Sensor Not Found"));
  return res.status(200).json({ success: true, data: sensor });
});

// update single sensor
// -------------------
const updateSingleSensor = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { sensorId } = req.params;
  if (!isValidObjectId(sensorId)) return next(new CustomError(400, "Invalid Sensor Id"));
  const { name, type, uniqueId } = req.body;
  if (!name && !type && !uniqueId) return next(new CustomError(400, "Please Provide at least one field"));
  const sensor = await Sensor.findOne({ _id: sensorId, ownerId });
  if (!sensor) return next(new CustomError(400, "Sensor Not Found"));
  if (name) sensor.name = name;
  if (type) sensor.type = type;
  if (uniqueId) {
    const isExist = await Sensor.findOne({ uniqueId });
    if (isExist) return next(new CustomError(400, "Unique id already exists"));
    sensor.uniqueId = uniqueId;
  }
  await sensor.save();
  return res.status(200).json({ success: true, message: "Sensor Updated Successfully" });
});

// delete single sensor
// -------------------
const deleteSingleSensor = asyncHandler(async (req, res, next) => {
  const ownerId = req?.user?._id;
  const { sensorId } = req.params;
  if (!isValidObjectId(sensorId)) return next(new CustomError(400, "Invalid Sensor Id"));
  const sensor = await Sensor.findOneAndDelete({ _id: sensorId, ownerId });
  if (!sensor) return next(new CustomError(400, "Sensor Not Found"));
  return res.status(200).json({ success: true, message: "Sensor Deleted Successfully" });
});

export { createSensor, deleteSingleSensor, getAllSensors, getSingleSensor, updateSingleSensor };
