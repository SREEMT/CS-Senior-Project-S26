import Dog from "../models/dog.model.js";

export async function createDog(dogData) {
  const name = dogData.name != null ? String(dogData.name).trim() : "";
  if (!name) {
    throw new Error("Missing required field: name");
  }
  const payload = {
    name,
    birthDate: dogData.birthDate ?? dogData.dateOfBirth,
    vet: dogData.vet ?? dogData.veterinarian ?? "",
    status: dogData.status ?? "",
    color: dogData.color ?? "",
  };
  if (dogData.ownerId != null) {
    payload.ownerId = dogData.ownerId;
  }
  return await Dog.create(payload);
}

export async function getDogsByOwner(ownerId) {
  return await Dog.find({ ownerId });
}

export async function getAllDogs() {
  return await Dog.find().populate("ownerId", "name email");
}

export async function deleteDog(dogId) {
  return await Dog.findByIdAndDelete(dogId);
}