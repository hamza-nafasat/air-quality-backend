import express from "express";
import { singleUpload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  createSensor,
  deleteSingleSensor,
  getAllSensors,
  getSingleSensor,
  updateSingleSensor,
} from "../controllers/sensor.controller.js";

const app = express();

app.post("/create", isAuthenticated, createSensor);
app
  .route("/single/:sensorId")
  .get(isAuthenticated, getSingleSensor)
  .put(isAuthenticated, singleUpload, updateSingleSensor)
  .delete(isAuthenticated, deleteSingleSensor);

app.get("/all", isAuthenticated, getAllSensors);

export default app;
