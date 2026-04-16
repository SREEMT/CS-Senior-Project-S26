import { useEffect, useMemo, useState } from "react";
import { fetchEvents, listRsvps } from "../services/events";
import { fetchWeather } from "../services/weather";
import "./Home.css";

function isUpcomingEvent(ev) {
  const start = new Date(ev.startTime);
  return !Number.isNaN(start.getTime()) && start.getTime() > Date.now();
}

function formatEventDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventTimeRange(ev) {
  const start = new Date(ev.startTime);
  const end = new Date(ev.endTime);
  if (Number.isNaN(start.getTime())) return "";
  const opts = { hour: "numeric", minute: "2-digit" };
  const a = start.toLocaleTimeString(undefined, opts);
  if (Number.isNaN(end.getTime())) return a;
  const b = end.toLocaleTimeString(undefined, opts);
  return `${a} – ${b}`;
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [rsvpsByEvent, setRsvpsByEvent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const upcomingSorted = useMemo(() => {
    const list = events.filter(isUpcomingEvent);
    list.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    return list;
  }, [events]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEvents();
        if (!cancelled) setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (upcomingSorted.length === 0) {
      setRsvpsByEvent({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const pairs = await Promise.all(
          upcomingSorted.map(async (ev) => {
            const rows = await listRsvps(ev.id);
            return [ev.id, Array.isArray(rows) ? rows : []];
          })
        );
        if (!cancelled) {
          const next = {};
          for (const [id, rows] of pairs) next[id] = rows;
          setRsvpsByEvent(next);
        }
      } catch {
        if (!cancelled) setRsvpsByEvent({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [upcomingSorted]);

  useEffect(() => {
    let cancelled = false;
    setWeatherLoading(true);
    setWeatherError(null);

    fetchWeather()
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch((err) => {
        if (!cancelled) setWeatherError(err.message || "Weather unavailable");
      })
      .finally(() => {
        if (!cancelled) setWeatherLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home-page">
      <div className="home-inner">
        <div className="home-top-row">
          <h1 className="home-title">Upcoming Events</h1>
          <aside className="home-weather" aria-label="Current weather">
            {weatherLoading && (
              <div className="home-weather-loading">Loading weather…</div>
            )}
            {!weatherLoading && weatherError && (
              <div className="home-weather-error">{weatherError}</div>
            )}
            {!weatherLoading && !weatherError && weather && (
              <>
                <div className="home-weather-temp">
                  {weather.temperature != null
                    ? `${weather.temperature}°${weather.temperatureUnit || "F"}`
                    : "—"}
                </div>
                {weather.shortForecast && (
                  <div className="home-weather-detail">{weather.shortForecast}</div>
                )}
                {weather.locationLabel && (
                  <div className="home-weather-meta">{weather.locationLabel}</div>
                )}
              </>
            )}
          </aside>
        </div>

        {error && <p className="home-error">{error}</p>}

        {loading && <p className="home-loading">Loading events…</p>}

        {!loading && !error && upcomingSorted.length === 0 && (
          <p className="home-empty">No upcoming events.</p>
        )}

        {!loading && upcomingSorted.length > 0 && (
          <div className="home-events">
            {upcomingSorted.map((ev) => {
              const dateStr = formatEventDate(ev.startTime);
              const titleLine =
                dateStr.length > 0
                  ? `${ev.title} (${dateStr})`
                  : ev.title;
              const rsvps = rsvpsByEvent[ev.id] ?? [];
              return (
                <article key={ev.id} className="home-event-card">
                  <div className="home-event-title-row">{titleLine}</div>
                  {ev.description ? (
                    <p className="home-event-desc">{ev.description}</p>
                  ) : null}
                  <div className="home-event-meta">
                    {formatEventTimeRange(ev)}
                    {ev.location ? ` · ${ev.location}` : ""}
                  </div>
                  <h2 className="home-rsvp-heading">RSVPs</h2>
                  {rsvps.length === 0 ? (
                    <p className="home-empty" style={{ fontSize: "0.88rem" }}>
                      No RSVPs yet.
                    </p>
                  ) : (
                    <div className="home-rsvp-list">
                      {rsvps.map((r) => (
                        <div key={r.id} className="home-rsvp-row">
                          <span className="home-rsvp-name">
                            {r.user?.name ?? "Unknown"}
                          </span>
                          <span className="home-rsvp-status">{r.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
