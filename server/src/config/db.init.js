import CommunicationLog from "../models/commLog.model.js";
import TrainingLog from "../models/trainingLog.model.js";
import { connectDB } from "./db.js";

export async function initDB() {
  // 1. Mongoose indexes
  await Promise.all([
    CommunicationLog.syncIndexes(),
    TrainingLog.syncIndexes()
  ]);

  // 2. Native Mongo indexes (certifications)
  const conn = await connectDB();
  const certCollection = conn.db.collection("certifications");

  await certCollection.createIndex(
    {
      title: "text",
      issuer: "text"
    },
    {
      name: "CertificationTextIndex"
    }
  );

  console.log("All indexes synced (logs + certifications)");
}