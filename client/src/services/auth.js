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

export async function registerDog(formData) {
  const res = await fetch(`${API_BASE}/dogs/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const text = await res.text();
    let errMsg = "Dog registration failed";
    try {
      const err = JSON.parse(text);
      errMsg = err.error || err.message || errMsg;
    } catch {
      if (text) errMsg = text;
      else if (res.status === 404) errMsg = "Registration endpoint not found. Is the server running?";
    }
    throw new Error(errMsg);
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
  window.location.href = "/";
}