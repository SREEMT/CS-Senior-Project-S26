import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Return the active mongoose connection so callers that need
    // the native driver (e.g., GridFS in certification.model) can use it.
    return conn.connection;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};
