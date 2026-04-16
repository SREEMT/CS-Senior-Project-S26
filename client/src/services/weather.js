const API_BASE = "/api";

/**
 * @param {number} [lat]
 * @param {number} [lon]
 */
export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams();
  if (typeof lat === "number" && !Number.isNaN(lat)) {
    params.set("lat", String(lat));
  }
  if (typeof lon === "number" && !Number.isNaN(lon)) {
    params.set("lon", String(lon));
  }
  const q = params.toString();
  const res = await fetch(`${API_BASE}/weather${q ? `?${q}` : ""}`, {
    method: "GET",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load weather");
  }
  return res.json();
}
