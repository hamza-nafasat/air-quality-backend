import mongoose from "mongoose";
import { imageSchema } from "./global.model.js";

const buildingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    area: { type: String, required: true },
    address: { type: String, required: true },
    thumbnail: { type: imageSchema, required: true },
    twoDModel: { type: imageSchema, required: true },
    position: { type: [Number, Number], required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    floors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Floor" }],
  },
  { timestamps: true }
);

export const Building = mongoose.model("Building", buildingSchema);
