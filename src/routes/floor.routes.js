import express from "express";
import { singleUpload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  createFloor,
  deleteSingleFloor,
  getAllFloorsOfBuilding,
  getSingleFloor,
  updateSingleFloor,
} from "../controllers/floor.controller.js";

const app = express();

app.post("/create", isAuthenticated, singleUpload, createFloor);
app
  .route("/single/:floorId")
  .get(isAuthenticated, getSingleFloor)
  .put(isAuthenticated, singleUpload, updateSingleFloor)
  .delete(isAuthenticated, deleteSingleFloor);

app.get("/all", isAuthenticated, getAllFloorsOfBuilding);

export default app;
