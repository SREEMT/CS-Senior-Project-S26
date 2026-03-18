import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyNote,
  saveMyNote,
  getMyRsvp,
  saveMyRsvp,
  listRsvps,
} from "../services/events";
import { getToken, logout } from "../services/auth";
import "./Calendar.css";

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingEvent, setSavingEvent] = useState(false);
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [savingRsvpId, setSavingRsvpId] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [form, setForm] = useState({
    id: null,
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
  });
  const [notes, setNotes] = useState({});
  const [myRsvps, setMyRsvps] = useState({});
  const [rsvpsByEvent, setRsvpsByEvent] = useState({});

  const token = getToken();
  const isAdmin = useMemo(() => {
    if (!token) return false;
    const payload = parseJwt(token);
    return payload?.role === "admin";
  }, [token]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMessage(null);
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (err) {
        setMessage(err.message || "Failed to load events");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Load saved note when user selects an event
  useEffect(() => {
    if (!form.id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getMyNote(form.id);
        if (!cancelled) {
          setNotes((prev) => ({ ...prev, [form.id]: (data.note ?? "").toString() }));
        }
      } catch {
        if (!cancelled) {
          setNotes((prev) => ({ ...prev, [form.id]: "" }));
        }
      }
    })();
    return () => { cancelled = true; };
  }, [form.id]);

  // Load RSVP data when user selects an event
  useEffect(() => {
    if (!form.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [mine, all] = await Promise.all([getMyRsvp(form.id), listRsvps(form.id)]);
        if (!cancelled) {
          setMyRsvps((prev) => ({ ...prev, [form.id]: (mine.status ?? "").toString() }));
          setRsvpsByEvent((prev) => ({ ...prev, [form.id]: Array.isArray(all) ? all : [] }));
        }
      } catch {
        if (!cancelled) {
          setMyRsvps((prev) => ({ ...prev, [form.id]: "" }));
          setRsvpsByEvent((prev) => ({ ...prev, [form.id]: [] }));
        }
      }
    })();
    return () => { cancelled = true; };
  }, [form.id]);

  function resetForm() {
    setForm({
      id: null,
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      description: "",
    });
  }

  function handleMonthChange(delta) {
    setCurrentMonth((prev) => {
      const m = new Date(prev);
      m.setMonth(m.getMonth() + delta);
      return new Date(m.getFullYear(), m.getMonth(), 1);
    });
  }

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const cells = [];
    for (let i = 0; i < startIndex; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const ev of events) {
      const d = new Date(ev.startTime);
      const key = d.toISOString().slice(0, 10);
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(ev);
    }
    return map;
  }, [events]);

  function openEdit(ev) {
    const start = new Date(ev.startTime);
    const end = new Date(ev.endTime);
    setForm({
      id: ev.id,
      title: ev.title,
      description: ev.description ?? "",
      date: start.toISOString().slice(0, 10),
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
    });
  }

  function handleFieldChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isAdmin) return;
    setSavingEvent(true);
    setMessage(null);
    const start = new Date(`${form.date}T${form.startTime}:00`);
    const end = new Date(`${form.date}T${form.endTime}:00`);
    const payload = {
      title: form.title,
      description: form.description,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };
    try {
      let saved;
      if (form.id) {
        saved = await updateEvent(form.id, payload);
        setEvents((prev) => prev.map((ev) => (ev.id === saved.id ? saved : ev)));
        setMessage("Event updated.");
      } else {
        saved = await createEvent(payload);
        setEvents((prev) => [...prev, saved]);
        setMessage("Event created.");
      }
      setMessageType("success");
      resetForm();
    } catch (err) {
      setMessage(err.message || "Failed to save event");
      setMessageType("error");
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleDelete(ev) {
    if (!isAdmin) return;
    if (!window.confirm(`Delete event "${ev.title}"? This cannot be undone.`)) return;
    setMessage(null);
    try {
      await deleteEvent(ev.id);
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
      setMessage("Event deleted.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message || "Failed to delete event");
      setMessageType("error");
    }
  }

  async function handleSaveNote(ev, text) {
    setSavingNoteId(ev.id);
    setMessage(null);
    try {
      await saveMyNote(ev.id, text);
      setNotes((prev) => ({ ...prev, [ev.id]: text }));
      setMessage("Note saved.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message || "Failed to save note");
      setMessageType("error");
    } finally {
      setSavingNoteId(null);
    }
  }

  async function handleSaveRsvp(ev, status) {
    setSavingRsvpId(ev.id);
    setMessage(null);
    try {
      await saveMyRsvp(ev.id, status);
      setMyRsvps((prev) => ({ ...prev, [ev.id]: status }));
      const refreshed = await listRsvps(ev.id);
      setRsvpsByEvent((prev) => ({ ...prev, [ev.id]: Array.isArray(refreshed) ? refreshed : [] }));
      setMessage("RSVP saved.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message || "Failed to save RSVP");
      setMessageType("error");
    } finally {
      setSavingRsvpId(null);
    }
  }

  function formatRsvpTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours %= 12;
    if (hours === 0) hours = 12;
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${minutes} ${ampm}`;
  }

  const monthLabel = currentMonth.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="page-full-column calendar-page">
        <div className="calendar-page-inner">
          <p className="calendar-loading">Loading calendar…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-full-column calendar-page">
      <div className="calendar-page-inner">
        <header className="calendar-header">
          <div className="calendar-header-main">
            <h2>Event Calendar</h2>
            <div className="calendar-month-switcher">
              <button type="button" onClick={() => handleMonthChange(-1)} aria-label="Previous month">
                ‹
              </button>
              <span>{monthLabel}</span>
              <button type="button" onClick={() => handleMonthChange(1)} aria-label="Next month">
                ›
              </button>
            </div>
          </div>
          <div className="calendar-header-actions" />
        </header>

        {message && (
          <p className={`calendar-message ${messageType === "error" ? "error" : "success"}`}>
            {message}
          </p>
        )}

        <div className="calendar-layout">
          <section className="calendar-grid card-like">
            <div className="calendar-grid-header">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="calendar-grid-col-label">
                  {d}
                </div>
              ))}
            </div>
            <div className="calendar-grid-body">
              {calendarDays.map((date, idx) => {
                if (!date) {
                  return <div key={idx} className="calendar-cell empty" />;
                }
                const key = date.toISOString().slice(0, 10);
                const dayEvents = eventsByDay[key] ?? [];
                return (
                  <div key={key} className="calendar-cell">
                    <div className="calendar-cell-date">{date.getDate()}</div>
                    <div className="calendar-cell-events">
                      {dayEvents.map((ev) => (
                        <button
                          type="button"
                          key={ev.id}
                          className="calendar-event-chip"
                          onClick={() => openEdit(ev)}
                        >
                          <span className="calendar-event-time">
                            {new Date(ev.startTime).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="calendar-event-title">{ev.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="calendar-sidebar">
            {isAdmin && (
              <div className="calendar-card">
                <h3>{form.id ? "Edit event" : "Add event"}</h3>
                <form onSubmit={handleSubmit}>
                  <input
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleFieldChange}
                    required
                  />
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFieldChange}
                    required
                  />
                  <div className="calendar-time-row">
                    <input
                      type="time"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleFieldChange}
                      required
                    />
                    <input
                      type="time"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleFieldChange}
                      required
                    />
                  </div>
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleFieldChange}
                    rows={3}
                  />
                  <div className="calendar-form-actions">
                    <button type="submit" disabled={savingEvent}>
                      {savingEvent ? "Saving…" : form.id ? "Update event" : "Create event"}
                    </button>
                    {form.id && (
                      <button type="button" className="btn-secondary" onClick={resetForm}>
                        Clear
                      </button>
                    )}
                    {form.id && (
                      <button
                        type="button"
                        className="btn-secondary calendar-delete-btn"
                        onClick={() =>
                          handleDelete(events.find((e) => e.id === form.id) || { id: form.id, title: form.title })
                        }
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            <div className="calendar-card">
              <h3>My note for selected day</h3>
              <p className="calendar-note">
                Personal notes are only visible to you.
              </p>
              {form.id ? (
                <>
                  <textarea
                    rows={4}
                    value={notes[form.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [form.id]: e.target.value }))}
                    onBlur={(e) => handleSaveNote({ id: form.id }, e.target.value)}
                    placeholder="Add a personal note about this event…"
                  />
                  <button
                    type="button"
                    className="calendar-save-note-btn"
                    onClick={() => handleSaveNote({ id: form.id }, notes[form.id] ?? "")}
                    disabled={!!savingNoteId}
                  >
                    {savingNoteId === form.id ? "Saving…" : "Save note"}
                  </button>
                </>
              ) : (
                <p className="calendar-note">Select an event from the calendar to add a note.</p>
              )}
              {savingNoteId && savingNoteId !== form.id && (
                <p className="calendar-saving-note">Saving note…</p>
              )}
            </div>

            <div className="calendar-card">
              <h3>RSVP for selected event</h3>
              <p className="calendar-note">Your RSVP is visible to other users.</p>
              {form.id ? (
                <>
                  <div className="calendar-rsvp-row">
                    {["Yes", "Maybe", "No"].map((opt) => (
                      <label key={opt} className="calendar-rsvp-option">
                        <input
                          type="radio"
                          name="rsvp"
                          value={opt}
                          checked={(myRsvps[form.id] ?? "") === opt}
                          onChange={(e) => handleSaveRsvp({ id: form.id }, e.target.value)}
                          disabled={savingRsvpId === form.id}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  <div className="calendar-rsvp-list">
                    {(rsvpsByEvent[form.id] ?? []).length ? (
                      (rsvpsByEvent[form.id] ?? []).map((r) => (
                        <div key={r.id} className="calendar-rsvp-item">
                          <div className="calendar-rsvp-item-main">
                            <span className="calendar-rsvp-name">{r.user?.name ?? "Unknown"}</span>
                            <span className="calendar-rsvp-status">{r.status}</span>
                          </div>
                          <div className="calendar-rsvp-time">{formatRsvpTime(r.updatedAt)}</div>
                        </div>
                      ))
                    ) : (
                      <p className="calendar-note">No RSVPs yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="calendar-note">Select an event from the calendar to RSVP.</p>
              )}
              {savingRsvpId && savingRsvpId !== form.id && (
                <p className="calendar-saving-note">Saving RSVP…</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

