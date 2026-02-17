// Model layer for user feature
// Handles data retrieval and access
// Methods: createUser, findUserByUsername, findUserByEamil, findUserById, updateUser, deleteUser, clearUsers

// Creates random ID for user
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
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
    username: {
      type: String, 
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    birthdate: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    csdnumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    emergencycontact: {
      type: String,
      required: true,
    },
    emergencyphone: {
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
  const trim = (v) => (v != null ? String(v).trim() : undefined);
  const doc = {
    name: trim(userData.name),
    email: trim(userData.email),
    username: trim(userData.username),
    password: userData.password,
    birthdate: trim(userData.birthdate),
    address: trim(userData.address),
    phone: trim(userData.phone),
    csdnumber: trim(userData.csdnumber ?? userData.csdNumber),
    emergencycontact: trim(userData.emergencycontact ?? userData.emergencyContact),
    emergencyphone: trim(userData.emergencyphone ?? userData.emergencyPhone),
  };
  const user = await User.create(doc);
  const obj = user.toObject();
  obj.id = obj._id.toString();
  delete obj.password;
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

export async function findUserByUsername(username) {
  const user = await User.findOne({ username });
  if (!user) return null;
  const obj = user.toObject();
  obj.id = obj._id.toString();
  return obj;
}

/** Remove all users (for tests). */
export async function clearUsers() {
  await User.deleteMany({});
}