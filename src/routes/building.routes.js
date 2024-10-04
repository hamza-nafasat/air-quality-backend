import express from "express";
import {
  createBuilding,
  deleteSingleBuilding,
  getAllBuildings,
  getSingleBuilding,
  updateSingleBuilding,
} from "../controllers/building.controller.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { multiUpload } from "../middlewares/multer.js";

const app = express();

app.post("/create", isAuthenticated, multiUpload, createBuilding);
app
  .route("/single/:buildingId")
  .get(isAuthenticated, getSingleBuilding)
  .put(isAuthenticated, multiUpload, updateSingleBuilding)
  .delete(isAuthenticated, deleteSingleBuilding);

app.get("/all", isAuthenticated, getAllBuildings);

export default app;
