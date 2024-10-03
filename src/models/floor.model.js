import mongoose from "mongoose";
import { imageSchema } from "./global.model.js";

const buildingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    room: { type: Number, required: true },
    area: { type: String, required: true },
    floors: [{ type: Number, required: true }],
    twoDModel: { type: imageSchema, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    sensors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sensor" }],
  },
  { timestamps: true }
);

export const Building = mongoose.model("Building", buildingSchema);
