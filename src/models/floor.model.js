import mongoose from "mongoose";
import { imageSchema } from "./global.model.js";

const floorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rooms: { type: Number, required: true },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building" },
    area: { type: String, required: true },
    twoDModel: { type: imageSchema, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    sensors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sensor" }],
  },
  { timestamps: true }
);

export const Floor = mongoose.model("Floor", floorSchema);
