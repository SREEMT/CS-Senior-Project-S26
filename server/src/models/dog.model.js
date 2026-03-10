import mongoose from "mongoose";

const dogSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    birthDate: Date,
    vet: String,
    status: String,
    color: String,
  },
  { timestamps: true }  
);

export default mongoose.model("Dog", dogSchema);