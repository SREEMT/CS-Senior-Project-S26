import Dog from "../models/dog.model.js";

export async function createDog(dogData) {
  return await Dog.create(dogData);
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