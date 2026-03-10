import * as dogService from "../services/dog.service.js";

export async function createDog(req) {
  try {
    const body = await req.json();

    const dog = await dogService.createDog({
      ...body,
      ownerId: req.user?.id ?? body.ownerId,
    });

    return new Response(
      JSON.stringify({
        message: "Dog created successfully",
        data: dog,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Public dog registration (no auth required) – same as user registration flow
export async function registerDog(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Request body must be JSON object" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const name = body.name != null ? String(body.name).trim() : "";
    if (!name) {
      return new Response(
        JSON.stringify({ error: "Missing required field: name" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const rawBirth = body.dateOfBirth || body.birthDate;
    const birthDate = rawBirth && String(rawBirth).trim() ? rawBirth : undefined;

    const dog = await dogService.createDog({
      name,
      birthDate,
      vet: (body.veterinarian ?? body.vet ?? "").toString().trim(),
      status: (body.status ?? "").toString().trim(),
      color: (body.color ?? "").toString().trim(),
    });

    return new Response(
      JSON.stringify({
        message: "Dog registered successfully",
        data: dog,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const isClientError = err.name === "ValidationError" || err.message?.includes("required");
    return new Response(
      JSON.stringify({ error: err.message || "Dog registration failed" }),
      {
        status: isClientError ? 400 : 500,
        headers: { "Content-Type": "application/json" },
      }
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
