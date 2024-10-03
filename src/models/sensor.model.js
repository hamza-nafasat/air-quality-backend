import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    uniqueId: { type: String, required: true },
    isConnected: { type: Boolean, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
  },
  { timestamps: true }
);

export const Sensor = mongoose.model("Sensor", sensorSchema);
