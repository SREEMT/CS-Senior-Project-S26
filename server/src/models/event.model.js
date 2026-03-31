import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;

export async function createEvent(data) {
  const event = await Event.create(data);
  const obj = event.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export async function updateEvent(id, updates) {
  const event = await Event.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!event) return null;
  const obj = event.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export async function deleteEventById(id) {
  const doc = await Event.findByIdAndDelete(id);
  if (!doc) return null;
  return { deleted: true, id };
}

export async function findEventById(id) {
  const event = await Event.findById(id);
  if (!event) return null;
  const obj = event.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export async function findEventsInRange(start, end) {
  const query = {};
  if (start || end) {
    query.startTime = {};
    if (start) query.startTime.$gte = start;
    if (end) query.startTime.$lte = end;
  }
  const events = await Event.find(query).sort({ startTime: 1 });
  return events.map((e) => {
    const obj = e.toObject();
    obj.id = obj._id.toString();
    return obj;
  });
}

