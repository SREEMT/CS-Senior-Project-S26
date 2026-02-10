export async function authenticate(req, next) {

  req.user = {
    id: "demo-user-id",
    role: "user", // change to "admin" to test admin routes
  };

  return next();
}

export function authorizeAdmin(req, next) {
  if (req.user?.role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Admin access required" }),
      { status: 403 }
    );
  }

  return next();
}
