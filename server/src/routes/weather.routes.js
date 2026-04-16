/**
 * Proxies Weather.gov (api.weather.gov)
 */

const NWS_USER_AGENT = "(CSD-Central; https://github.com/)";

/** Baltimore, MD*/
const DEFAULT_LAT = 39.2904;
const DEFAULT_LON = -76.6122;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/geo+json",
      "User-Agent": NWS_USER_AGENT,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Weather API error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function weatherRoutes(req) {
  const url = new URL(req.url);
  if (req.method !== "GET" || url.pathname !== "/api/weather") {
    return null;
  }

  let lat = parseFloat(url.searchParams.get("lat") ?? "");
  let lon = parseFloat(url.searchParams.get("lon") ?? "");
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    lat = DEFAULT_LAT;
    lon = DEFAULT_LON;
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return jsonResponse({ error: "Invalid coordinates" }, 400);
  }

  try {
    const pointsUrl = `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`;
    const points = await fetchJson(pointsUrl);
    const forecastUrl = points?.properties?.forecast;
    if (!forecastUrl || typeof forecastUrl !== "string") {
      return jsonResponse({ error: "No forecast URL for this location" }, 502);
    }

    const forecast = await fetchJson(forecastUrl);
    const periods = forecast?.properties?.periods;
    if (!Array.isArray(periods) || periods.length === 0) {
      return jsonResponse({ error: "No forecast periods returned" }, 502);
    }

    const daytime =
      periods.find((p) => p && p.isDaytime === true) ?? periods[0];
    const p = daytime;

    return jsonResponse({
      locationLabel: points?.properties?.relativeLocation?.properties?.city
        ? `${points.properties.relativeLocation.properties.city}, ${points.properties.relativeLocation.properties.state}`
        : null,
      temperature: p.temperature,
      temperatureUnit: p.temperatureUnit ?? "F",
      shortForecast: p.shortForecast ?? "",
      isDaytime: p.isDaytime ?? true,
      icon: p.icon ?? null,
      windSpeed: p.windSpeed ?? null,
      updated: forecast?.properties?.updated ?? null,
    });
  } catch (err) {
    const message = err?.message || "Weather request failed";
    return jsonResponse({ error: message }, 502);
  }
}
