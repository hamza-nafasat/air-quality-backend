import cookieParser from "cookie-parser";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import AuthRoutes from "./routes/auth.routes.js";
import SensorRoutes from "./routes/sensor.routes.js";
import BuildingRoutes from "./routes/building.routes.js";
import FloorRoutes from "./routes/floor.routes.js";
import cors from "cors";

const app = express();

// middlewares
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "https://work-force-frontend.vercel.app"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/api/auth", AuthRoutes);
app.use("/api/floor", FloorRoutes);
app.use("/api/building", BuildingRoutes);
app.use("/api/sensor", SensorRoutes);

// error handler
app.use(errorHandler);

export default app;
