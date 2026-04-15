import { Db } from "mongodb";
import mongoose from "mongoose";

const trainingLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dog",
      required: true,
    },

    // Optional link back to a calendar event
    eventId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Event",
      default: null,
    },

    //auto-filled from calendar events
    date: { type: String, required: true, trim: true }, // YYYY-MM-DD
    location: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true }, // HH:MM
    startTime: { type: String, required: true, trim: true }, // HH:MM
    stopTime: { type: String, required: true, trim: true }, // HH:MM
  },
  { timestamps: true }
);

// Indexing schema for training logs
trainingLogSchema.index({
  location: "text",
  date: "text"
});
trainingLogSchema.index({
  userId: 1,
  dogId: 1,
  createdAt: -1
});

const TrainingLog = mongoose.model("TrainingLog", trainingLogSchema);

export async function createTrainingLog(data) {
  const trim = (v) => (v != null ? String(v).trim() : undefined);

  const doc = {
    userId: data.userId,
    dogId: data.dogId,
    eventId: data.eventId ?? null,
    date: trim(data.date),
    location: trim(data.location),
    time: trim(data.time),
    startTime: trim(data.startTime),
    stopTime: trim(data.stopTime),
  };

  const log = await TrainingLog.create(doc);
  const obj = log.toObject();
  obj.id = obj._id.toString();
  obj._id = undefined;
  return obj;
}

export async function findMyTrainingLogs(userId) {
  const logs = await TrainingLog.find({ userId })
    .sort({ createdAt: -1 })
    .populate("dogId", "name")
    .lean();

  return logs.map((l) => {
    const dogId = l.dogId?._id ? l.dogId._id.toString() : l.dogId?.toString?.() ?? null;
    return {
      ...l,
      id: l._id.toString(),
      dogId,
      dogName: l.dogId?.name ?? "",
      _id: undefined,
      dogIdObj: undefined,
    };
  });
}

export async function findTrainingLogById(id) {
  const log = await TrainingLog.findById(id).lean();
  if (!log) return null;
  return {
    ...log,
    id: log._id.toString(),
    _id: undefined,
  };
}

export async function deleteTrainingLogById(id) {
  return await TrainingLog.findByIdAndDelete(id);
}

export default TrainingLog;

