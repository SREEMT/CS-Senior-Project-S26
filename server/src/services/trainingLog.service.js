import {
  createTrainingLog,
  findMyTrainingLogs,
  findTrainingLogById,
  deleteTrainingLogById,
} from "../models/trainingLog.model.js";

export async function logTraining(user, data) {
  const trim = (v) => (v != null ? String(v).trim() : undefined);

  if (!user?._id) throw new Error("Unauthorized");
  if (!data?.dogId) throw new Error("Dog is required");

  const date = trim(data.date);
  const location = trim(data.location);
  const time = trim(data.time);
  const startTime = trim(data.startTime);
  const stopTime = trim(data.stopTime);

  if (!date) throw new Error("Date is required");
  if (!location) throw new Error("Location is required");
  if (!time) throw new Error("Time is required");
  if (!startTime) throw new Error("Start Time is required");
  if (!stopTime) throw new Error("Stop Time is required");

  return await createTrainingLog({
    userId: user._id,
    dogId: data.dogId,
    eventId: data.eventId ?? null,
    date,
    location,
    time,
    startTime,
    stopTime,
  });
}

export async function getMyTraining(user) {
  if (!user?._id) throw new Error("Unauthorized");
  return await findMyTrainingLogs(user._id);
}

export async function deleteMyTrainingLog(user, logId) {
  const log = await findTrainingLogById(logId);
  if (!log) throw new Error("Training log not found");

  if (String(log.userId) !== String(user._id)) {
    throw new Error("Unauthorized");
  }

  await deleteTrainingLogById(logId);
  return true;
}

