// Model layer for user feature
// Handles data retrieval and access
// Methods: createUser, findUserByUsername, findUserByEamil, findUserById, updateUser, deleteUser, clearUsers

// Creates random ID for user
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String, 
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;

export async function createUser(userData) {
  const user = await User.create(userData);
  const obj = user.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export async function findUserByEmail(email) {
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) return null;
  const obj = user.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export async function findUserById(id) {
  const user = await User.findById(id).select("-password");
  if (!user) return null;
  const obj = user.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export async function updateUserModel(id, updates) {
  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) return null;

  const obj = user.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export async function deleteUser(id) {
  return await User.findByIdAndDelete(id);
}