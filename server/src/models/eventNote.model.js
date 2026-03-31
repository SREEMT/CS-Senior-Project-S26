import mongoose from "mongoose";

const eventNoteSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

eventNoteSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const EventNote = mongoose.model("EventNote", eventNoteSchema);

export default EventNote;

export async function upsertNote({ eventId, userId, note }) {
  const doc = await EventNote.findOneAndUpdate(
    { eventId, userId },
    { note },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export async function getNoteForUser(eventId, userId) {
  const doc = await EventNote.findOne({ eventId, userId });
  if (!doc) return null;
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  return obj;
}

/** Delete all notes for an event */
export async function deleteNotesByEventId(eventId) {
  const result = await EventNote.deleteMany({ eventId });
  return result;
}

