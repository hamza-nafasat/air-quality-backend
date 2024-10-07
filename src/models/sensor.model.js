import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    ip: { type: String, required: true },
    url: { type: String, required: true },
    location: { type: String, required: true },
    port: { type: Number, required: true },
    uniqueId: { type: String, required: true },
    isConnected: { type: Boolean, required: true, default: false },
    floorId: { type: mongoose.Schema.Types.ObjectId, ref: "Floor", default: null },
    status: { type: Boolean, required: true, default: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
  },
  { timestamps: true }
);

export const Sensor = mongoose.model("Sensor", sensorSchema);
