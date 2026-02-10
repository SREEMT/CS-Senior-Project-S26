import * as dogService from "../services/dog.service.js";

export async function createDog(req) {
  try {
    const body = await req.json();

    const dog = await dogService.createDog({
      ...body,
      ownerId: req.user.id,
    });

    return new Response(
      JSON.stringify({
        message: "Dog created successfully",
        data: dog,
      }),
      { status: 201 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}

export async function getMyDogs(req) {
  try {
    const dogs = await dogService.getDogsByOwner(req.user.id);

    return new Response(
      JSON.stringify({ data: dogs }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}

export async function getAllDogs(req) {
  try {
    const dogs = await dogService.getAllDogs();

    return new Response(
      JSON.stringify({ data: dogs }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}

export async function deleteDog(req) {
  try {
    await dogService.deleteDog(req.params.id);

    return new Response(
      JSON.stringify({ message: "Dog deleted" }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
