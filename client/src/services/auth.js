const API_BASE = "/api";

export async function registerUser(formData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Registration failed");
  }

  return res.json();
}

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Login failed");
  }

  return res.json();
}





// Manages auth tokens for protected routes frontend

export function getToken() {
    return localStorage.getItem("token");
}

export function isAuthenticated() {
    return !!getToken();
}

export function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
}