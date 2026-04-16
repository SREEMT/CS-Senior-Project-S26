import {
  createTrainingLog,
  findMyTrainingLogs,
  findTrainingLogById,
  updateTrainingLogById,
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

export async function updateMyTrainingLog(user, logId, data) {
  const trim = (v) => (v != null ? String(v).trim() : undefined);

  if (!user?._id) throw new Error("Unauthorized");
  const existing = await findTrainingLogById(logId);
  if (!existing) throw new Error("Training log not found");
  if (String(existing.userId) !== String(user._id)) {
    throw new Error("Unauthorized");
  }

  const updates = {};
  if (data?.dogId !== undefined) updates.dogId = data.dogId;
  if (data?.eventId !== undefined) updates.eventId = data.eventId ?? null;
  if (data?.date !== undefined) updates.date = trim(data.date);
  if (data?.location !== undefined) updates.location = trim(data.location);
  if (data?.time !== undefined) updates.time = trim(data.time);
  if (data?.startTime !== undefined) updates.startTime = trim(data.startTime);
  if (data?.stopTime !== undefined) updates.stopTime = trim(data.stopTime);

  if (Object.keys(updates).length === 0) {
    throw new Error("No fields to update");
  }

  if (updates.dogId !== undefined && !updates.dogId) {
    throw new Error("Dog is required");
  }
  if (updates.date !== undefined && !updates.date) {
    throw new Error("Date is required");
  }
  if (updates.location !== undefined && !updates.location) {
    throw new Error("Location is required");
  }
  if (updates.time !== undefined && !updates.time) {
    throw new Error("Time is required");
  }
  if (updates.startTime !== undefined && !updates.startTime) {
    throw new Error("Start Time is required");
  }
  if (updates.stopTime !== undefined && !updates.stopTime) {
    throw new Error("Stop Time is required");
  }

  const updated = await updateTrainingLogById(logId, updates);
  if (!updated) throw new Error("Training log not found");
  return updated;
}
