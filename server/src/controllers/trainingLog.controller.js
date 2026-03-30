import {
  getMyTraining,
  logTraining,
  deleteMyTrainingLog,
} from "../services/trainingLog.service.js";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function createTrainingLogController(req) {
  try {
    const body = await req.json();
    const saved = await logTraining(req.user, body);
    return jsonResponse({ success: true, id: saved.id }, 201);
  } catch (err) {
    return jsonResponse(
      { error: err.message || "Failed to create training log" },
      400
    );
  }
}

export async function getMyTrainingLogsController(req) {
  try {
    const logs = await getMyTraining(req.user);
    return jsonResponse(logs);
  } catch (err) {
    return jsonResponse(
      { error: err.message || "Failed to load training logs" },
      400
    );
  }
}

export async function deleteMyTrainingLogController(req, { params } = {}) {
  try {
    const url = new URL(req.url);
    const id = params?.id ?? url.searchParams.get("id");

    if (!id) {
      return jsonResponse({ error: "Training log id required" }, 400);
    }

    await deleteMyTrainingLog(req.user, id);
    return jsonResponse({ success: true });
  } catch (err) {
    const message = err.message || "Failed to delete training log";
    const status = message === "Unauthorized" ? 403 : 400;
    return jsonResponse({ error: message }, status);
  }
}

