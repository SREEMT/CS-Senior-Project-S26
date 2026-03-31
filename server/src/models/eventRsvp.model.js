import mongoose from "mongoose";

const RSVP_VALUES = ["Yes", "Maybe", "No"];

const eventRsvpSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: RSVP_VALUES,
      required: true,
    },
  },
  { timestamps: true }
);

eventRsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const EventRsvp = mongoose.model("EventRsvp", eventRsvpSchema);

export default EventRsvp;
export const RSVP_STATUSES = RSVP_VALUES;

function toPublicObject(doc) {
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  return obj;
}

export async function upsertRsvp({ eventId, userId, status }) {
  const doc = await EventRsvp.findOneAndUpdate(
    { eventId, userId },
    { status },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
  return toPublicObject(doc);
}

export async function getRsvpForUser(eventId, userId) {
  const doc = await EventRsvp.findOne({ eventId, userId });
  if (!doc) return null;
  return toPublicObject(doc);
}

export async function listRsvpsForEvent(eventId) {
  const docs = await EventRsvp.find({ eventId })
    .populate("userId", "name")
    .sort({ updatedAt: -1 });

  return docs.map((d) => {
    const obj = toPublicObject(d);
    const user = d.userId
      ? {
          id: d.userId._id?.toString?.() ?? undefined,
          name: d.userId.name,
        }
      : null;
    return {
      ...obj,
      user,
    };
  });
}

/** Delete all RSVPs for an event */
export async function deleteRsvpsByEventId(eventId) {
  return await EventRsvp.deleteMany({ eventId });
}

