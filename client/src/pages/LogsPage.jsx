import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  createCommunicationLog,
  deleteCommunicationLog,
  getCommunicationLogs,
  updateCommunicationLog,
} from "../services/commLog.js";
import { fetchEvents } from "../services/events.js";
import { getMyDogs } from "../services/dogs.js";
import {
  createTrainingLog,
  deleteTrainingLog,
  getMyTrainingLogs,
  updateTrainingLog,
} from "../services/trainingLogs.js";
import { searchItems } from "../services/search.js";
import { getToken } from "../services/auth.js";
import "./LogsPage.css";

function formatTimestamp(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";

  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours %= 12;
  if (hours === 0) hours = 12;

  const hh = String(hours).padStart(2, "0");
  return `${month}/${day}/${year} ${hh}:${minutes} ${ampm}`;
}

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState("communication"); // 'communication' | 'training'
  const isCommunication = activeTab === "communication";

  // Communication logs state
  const [commLogs, setCommLogs] = useState([]);
  const [commLoading, setCommLoading] = useState(false);
  const [commSaving, setCommSaving] = useState(false);
  const [commMessage, setCommMessage] = useState(null);
  const [commForm, setCommForm] = useState({ title: "", body: "" });
  const [commUpdating, setCommUpdating] = useState(false);
  const [commEditingId, setCommEditingId] = useState(null);
  const [commEditForm, setCommEditForm] = useState({ title: "", body: "" });

  // Training logs state
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingSaving, setTrainingSaving] = useState(false);
  const [trainingMessage, setTrainingMessage] = useState(null);
  const [trainingUpdating, setTrainingUpdating] = useState(false);
  const [trainingEditingId, setTrainingEditingId] = useState(null);
  const [trainingEditForm, setTrainingEditForm] = useState({
    date: "",
    location: "",
    time: "",
    startTime: "",
    stopTime: "",
    dogId: "",
  });

  const [dogs, setDogs] = useState([]);
  const [dogsLoading, setDogsLoading] = useState(false);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState("manual");
  const [trainingForm, setTrainingForm] = useState({
    date: "",
    location: "",
    time: "",
    startTime: "",
    stopTime: "",
    dogId: "",
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    startDate: "",
    endDate: "",
    dogId: "",
  });
  const [searchSort, setSearchSort] = useState("latest");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const activeHeaderTitle = useMemo(() => {
    if (isCommunication) return "Communication Logs";
    return "Training Logs";
  }, [isCommunication]);

  const token = getToken();
  const myUserId = useMemo(() => {
    if (!token) return null;
    const payload = parseJwt(token);
    return payload?.userId ? String(payload.userId) : null;
  }, [token]);

  async function loadCommunicationLogs() {
    setCommLoading(true);
    setCommMessage(null);
    try {
      const data = await getCommunicationLogs();
      setCommLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setCommMessage(err.message || "Failed to load communication logs");
      setCommLogs([]);
    } finally {
      setCommLoading(false);
    }
  }

  async function loadTrainingLogs() {
    setTrainingLoading(true);
    setTrainingMessage(null);
    try {
      const data = await getMyTrainingLogs();
      setTrainingLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setTrainingMessage(err.message || "Failed to load training logs");
      setTrainingLogs([]);
    } finally {
      setTrainingLoading(false);
    }
  }

  async function loadDogsIfNeeded() {
    if (dogs.length > 0 || dogsLoading) return;
    setDogsLoading(true);
    try {
      const data = await getMyDogs();
      setDogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setTrainingMessage(err.message || "Failed to load your dogs");
      setDogs([]);
    } finally {
      setDogsLoading(false);
    }
  }

  async function loadEventsIfNeeded() {
    if (events.length > 0 || eventsLoading) return;
    setEventsLoading(true);
    try {
      const data = await fetchEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setTrainingMessage(err.message || "Failed to load events");
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }

  useEffect(() => {
    // Always load communication logs initially
    loadCommunicationLogs();
  }, []);

  useEffect(() => {
    if (!isCommunication) {
      loadTrainingLogs();
      loadDogsIfNeeded();
      loadEventsIfNeeded();
    }
  }, [isCommunication]);

  function handleCommunicationChange(e) {
    const { name, value } = e.target;
    setCommForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submitCommunication(e) {
    e.preventDefault();
    setCommSaving(true);
    setCommMessage(null);
    try {
      if (!commForm.title.trim()) throw new Error("Title is required");
      if (!commForm.body.trim()) throw new Error("Body is required");

      await createCommunicationLog({
        title: commForm.title,
        body: commForm.body,
      });

      setCommForm({ title: "", body: "" });
      await loadCommunicationLogs();
      setCommMessage("Communication log added.");
    } catch (err) {
      setCommMessage(err.message || "Failed to add communication log");
    } finally {
      setCommSaving(false);
    }
  }

  async function handleDeleteCommunication(id) {
    try {
      await deleteCommunicationLog(id);
      await loadCommunicationLogs();
    } catch (err) {
      alert(err.message || "Failed to delete communication log");
    }
  }

  function startEditCommunication(log) {
    setCommEditingId(log.id);
    setCommEditForm({
      title: log.title ?? "",
      body: log.body ?? "",
    });
    setCommMessage(null);
  }

  function cancelEditCommunication() {
    setCommEditingId(null);
    setCommEditForm({ title: "", body: "" });
  }

  function handleCommunicationEditChange(e) {
    const { name, value } = e.target;
    setCommEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function saveCommunicationEdit(id) {
    setCommUpdating(true);
    setCommMessage(null);
    try {
      if (!commEditForm.title.trim()) throw new Error("Title is required");
      if (!commEditForm.body.trim()) throw new Error("Body is required");

      await updateCommunicationLog(id, {
        title: commEditForm.title,
        body: commEditForm.body,
      });

      cancelEditCommunication();
      setSearchResults(null);
      await loadCommunicationLogs();
      setCommMessage("Communication log updated.");
    } catch (err) {
      setCommMessage(err.message || "Failed to update communication log");
    } finally {
      setCommUpdating(false);
    }
  }

  function applyEventToTrainingForm(eventId) {
    if (eventId === "manual") return;
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;

    const start = new Date(ev.startTime);
    const end = new Date(ev.endTime);

    setTrainingForm((prev) => ({
      ...prev,
      date: Number.isNaN(start.getTime()) ? prev.date : start.toISOString().slice(0, 10),
      location: (ev.location ?? "").toString(),
      time: Number.isNaN(start.getTime()) ? prev.time : start.toTimeString().slice(0, 5),
      startTime: Number.isNaN(start.getTime()) ? prev.startTime : start.toTimeString().slice(0, 5),
      stopTime: Number.isNaN(end.getTime()) ? prev.stopTime : end.toTimeString().slice(0, 5),
    }));
  }

  function handleTrainingFieldChange(e) {
    const { name, value } = e.target;
    setTrainingForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submitTraining(e) {
    e.preventDefault();
    setTrainingSaving(true);
    setTrainingMessage(null);
    try {
      if (!trainingForm.dogId) throw new Error("Dog is required");
      if (!trainingForm.date) throw new Error("Date is required");
      if (!trainingForm.location.trim()) throw new Error("Location is required");
      if (!trainingForm.time) throw new Error("Time is required");
      if (!trainingForm.startTime) throw new Error("Start Time is required");
      if (!trainingForm.stopTime) throw new Error("Stop Time is required");

      await createTrainingLog({
        ...trainingForm,
        eventId: selectedEventId !== "manual" ? selectedEventId : null,
      });

      setTrainingForm({
        date: "",
        location: "",
        time: "",
        startTime: "",
        stopTime: "",
        dogId: "",
      });
      setSelectedEventId("manual");

      await loadTrainingLogs();
      setTrainingMessage("Training log added.");
    } catch (err) {
      setTrainingMessage(err.message || "Failed to add training log");
    } finally {
      setTrainingSaving(false);
    }
  }

  async function handleDeleteTraining(id) {
    try {
      await deleteTrainingLog(id);
      await loadTrainingLogs();
    } catch (err) {
      alert(err.message || "Failed to delete training log");
    }
  }

  function startEditTraining(log) {
    setTrainingEditingId(log.id);
    setTrainingEditForm({
      date: log.date ?? "",
      location: log.location ?? "",
      time: log.time ?? "",
      startTime: log.startTime ?? "",
      stopTime: log.stopTime ?? "",
      dogId: log.dogId ? String(log.dogId) : "",
    });
    setTrainingMessage(null);
  }

  function cancelEditTraining() {
    setTrainingEditingId(null);
    setTrainingEditForm({
      date: "",
      location: "",
      time: "",
      startTime: "",
      stopTime: "",
      dogId: "",
    });
  }

  function handleTrainingEditFieldChange(e) {
    const { name, value } = e.target;
    setTrainingEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function saveTrainingEdit(id) {
    setTrainingUpdating(true);
    setTrainingMessage(null);
    try {
      if (!trainingEditForm.dogId) throw new Error("Dog is required");
      if (!trainingEditForm.date) throw new Error("Date is required");
      if (!trainingEditForm.location.trim()) throw new Error("Location is required");
      if (!trainingEditForm.time) throw new Error("Time is required");
      if (!trainingEditForm.startTime) throw new Error("Start Time is required");
      if (!trainingEditForm.stopTime) throw new Error("Stop Time is required");

      await updateTrainingLog(id, trainingEditForm);

      cancelEditTraining();
      setSearchResults(null);
      await loadTrainingLogs();
      setTrainingMessage("Training log updated.");
    } catch (err) {
      setTrainingMessage(err.message || "Failed to update training log");
    } finally {
      setTrainingUpdating(false);
    }
  }

  function canEditLog(log) {
    if (!myUserId || !log?.userId) return false;
    return String(log.userId) === myUserId;
  }

  // Search functions
  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function performSearch(sortOverride = searchSort) {
    setIsSearching(true);
    try {
      const filters = {
        ...searchFilters,
        type: isCommunication ? "communication_log" : "training_log",
        sortBy: sortOverride,
      };

      const results = await searchItems({ query: searchQuery, filters });
      setSearchResults(results);
    } catch (err) {
      alert(err.message || "Search failed");
    } finally {
      setIsSearching(false);
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchFilters({
      startDate: "",
      endDate: "",
      dogId: "",
    });
    setSearchSort("latest");
    setSearchResults(null);
  }

  function toggleSortOrder() {
    const nextSort = searchSort === "latest" ? "oldest" : "latest";
    setSearchSort(nextSort);

    if (searchResults !== null) {
      void performSearch(nextSort);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-full-column logs-page">
        <div className="logs-page-inner">
        <header className="logs-header">
          <div className="logs-header-main">
            <h2>{activeHeaderTitle}</h2>
            <label className="logs-type-select-wrap">
              <span className="sr-only">Log type</span>
              <select
                className="logs-type-select"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                <option value="communication">Communication Log</option>
                <option value="training">Training Log</option>
              </select>
            </label>
          </div>
        </header>

        {(isCommunication ? commMessage : trainingMessage) && (
          <p className="logs-message">{isCommunication ? commMessage : trainingMessage}</p>
        )}

        {isCommunication ? (
          <>
            <section className="logs-card">
              <h3>Add Communication Log</h3>
              <form onSubmit={submitCommunication} className="logs-form">
                <input
                  name="title"
                  placeholder="Title"
                  value={commForm.title}
                  onChange={handleCommunicationChange}
                  required
                />
                <textarea
                  name="body"
                  placeholder="Body"
                  value={commForm.body}
                  onChange={handleCommunicationChange}
                  rows={5}
                  required
                />
                <button type="submit" disabled={commSaving}>
                  {commSaving ? "Adding..." : "Add Log"}
                </button>
              </form>
            </section>

            <section className="logs-card logs-list-card">
              <div className="logs-list-header">
                <h3>Logs</h3>
              </div>

              {commLoading ? (
                <p className="logs-loading">Loading...</p>
              ) : searchResults && isCommunication ? (
                searchResults.length === 0 ? (
                  <p className="logs-empty">No matching communication logs found.</p>
                ) : (
                  <div className="logs-list">
                    {searchResults.map((log) => (
                      <div key={log.id} className="logs-item">
                        <div className="logs-item-meta">
                          <span className="logs-item-author">{log.userName}</span>
                          <span className="logs-item-timestamp">
                            {formatTimestamp(log.createdAt)}
                          </span>
                        </div>
                        {commEditingId === log.id ? (
                          <div className="logs-form logs-edit-form">
                            <input
                              name="title"
                              value={commEditForm.title}
                              onChange={handleCommunicationEditChange}
                              placeholder="Title"
                            />
                            <textarea
                              name="body"
                              value={commEditForm.body}
                              onChange={handleCommunicationEditChange}
                              rows={4}
                              placeholder="Body"
                            />
                            <div className="logs-item-actions">
                              <button
                                type="button"
                                className="logs-edit-btn"
                                disabled={commUpdating}
                                onClick={() => saveCommunicationEdit(log.id)}
                              >
                                {commUpdating ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                className="logs-cancel-btn"
                                disabled={commUpdating}
                                onClick={cancelEditCommunication}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="logs-item-title">{log.title}</div>
                            <div className="logs-item-body">{log.body}</div>
                            <div className="logs-item-actions">
                              {canEditLog(log) && (
                                <>
                                  <button
                                    type="button"
                                    className="logs-edit-btn"
                                    onClick={() => startEditCommunication(log)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="logs-delete-btn"
                                    onClick={() => handleDeleteCommunication(log.id)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : commLogs.length === 0 ? (
                <p className="logs-empty">No communication logs yet.</p>
              ) : (
                <div className="logs-list">
                  {commLogs.map((log) => (
                    <div key={log.id} className="logs-item">
                      <div className="logs-item-meta">
                        <span className="logs-item-author">{log.userName}</span>
                        <span className="logs-item-timestamp">
                          {formatTimestamp(log.createdAt)}
                        </span>
                      </div>
                      {commEditingId === log.id ? (
                        <div className="logs-form logs-edit-form">
                          <input
                            name="title"
                            value={commEditForm.title}
                            onChange={handleCommunicationEditChange}
                            placeholder="Title"
                          />
                          <textarea
                            name="body"
                            value={commEditForm.body}
                            onChange={handleCommunicationEditChange}
                            rows={4}
                            placeholder="Body"
                          />
                          <div className="logs-item-actions">
                            <button
                              type="button"
                              className="logs-edit-btn"
                              disabled={commUpdating}
                              onClick={() => saveCommunicationEdit(log.id)}
                            >
                              {commUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              className="logs-cancel-btn"
                              disabled={commUpdating}
                              onClick={cancelEditCommunication}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="logs-item-title">{log.title}</div>
                          <div className="logs-item-body">{log.body}</div>
                          <div className="logs-item-actions">
                            {canEditLog(log) && (
                              <>
                                <button
                                  type="button"
                                  className="logs-edit-btn"
                                  onClick={() => startEditCommunication(log)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="logs-delete-btn"
                                  onClick={() => handleDeleteCommunication(log.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <section className="logs-card">
              <h3>Add Training Log</h3>
              <form onSubmit={submitTraining} className="logs-form">
                <label className="logs-field">
                  <span className="logs-label">Choose calendar event (optional)</span>
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedEventId(id);
                      applyEventToTrainingForm(id);
                    }}
                    disabled={eventsLoading}
                  >
                    <option value="manual">Type date/location/time manually</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({formatTimestamp(ev.startTime).replace(" ", ", ")})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="logs-field">
                  <span className="logs-label">Date</span>
                  <input
                    type="date"
                    name="date"
                    value={trainingForm.date}
                    onChange={handleTrainingFieldChange}
                    required
                  />
                </label>

                <label className="logs-field">
                  <span className="logs-label">Location</span>
                  <input
                    name="location"
                    value={trainingForm.location}
                    onChange={handleTrainingFieldChange}
                    placeholder="Location"
                    required
                  />
                </label>

                <label className="logs-field">
                  <span className="logs-label">Time</span>
                  <input
                    type="time"
                    name="time"
                    value={trainingForm.time}
                    onChange={handleTrainingFieldChange}
                    required
                  />
                </label>

                <div className="logs-time-row">
                  <label className="logs-field">
                    <span className="logs-label">Start Time</span>
                    <input
                      type="time"
                      name="startTime"
                      value={trainingForm.startTime}
                      onChange={handleTrainingFieldChange}
                      required
                    />
                  </label>
                  <label className="logs-field">
                    <span className="logs-label">Stop Time</span>
                    <input
                      type="time"
                      name="stopTime"
                      value={trainingForm.stopTime}
                      onChange={handleTrainingFieldChange}
                      required
                    />
                  </label>
                </div>

                <label className="logs-field">
                  <span className="logs-label">Dog</span>
                  <select
                    name="dogId"
                    value={trainingForm.dogId}
                    onChange={handleTrainingFieldChange}
                    required
                    disabled={dogsLoading}
                  >
                    <option value="">Select a dog...</option>
                    {dogs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button type="submit" disabled={trainingSaving}>
                  {trainingSaving ? "Adding..." : "Add Log"}
                </button>
              </form>
            </section>

            <section className="logs-card logs-list-card">
              <div className="logs-list-header">
                <h3>My Training Logs</h3>
              </div>

              {trainingLoading ? (
                <p className="logs-loading">Loading...</p>
              ) : searchResults && !isCommunication ? (
                searchResults.length === 0 ? (
                  <p className="logs-empty">No matching training logs found.</p>
                ) : (
                  <div className="logs-list">
                    {searchResults.map((log) => (
                      <div key={log.id} className="logs-item">
                        <div className="logs-item-meta">
                          <span className="logs-item-author">
                            {log.dogName ||
                              (dogs.find((d) => d.id === log.dogId)?.name ?? "") ||
                              "Unknown Dog"}
                          </span>
                          <span className="logs-item-timestamp">
                            {formatTimestamp(log.createdAt)}
                          </span>
                        </div>
                        {trainingEditingId === log.id ? (
                          <div className="logs-form logs-edit-form">
                            <label className="logs-field">
                              <span className="logs-label">Date</span>
                              <input
                                type="date"
                                name="date"
                                value={trainingEditForm.date}
                                onChange={handleTrainingEditFieldChange}
                              />
                            </label>
                            <label className="logs-field">
                              <span className="logs-label">Location</span>
                              <input
                                name="location"
                                value={trainingEditForm.location}
                                onChange={handleTrainingEditFieldChange}
                              />
                            </label>
                            <label className="logs-field">
                              <span className="logs-label">Time</span>
                              <input
                                type="time"
                                name="time"
                                value={trainingEditForm.time}
                                onChange={handleTrainingEditFieldChange}
                              />
                            </label>
                            <div className="logs-time-row">
                              <label className="logs-field">
                                <span className="logs-label">Start Time</span>
                                <input
                                  type="time"
                                  name="startTime"
                                  value={trainingEditForm.startTime}
                                  onChange={handleTrainingEditFieldChange}
                                />
                              </label>
                              <label className="logs-field">
                                <span className="logs-label">Stop Time</span>
                                <input
                                  type="time"
                                  name="stopTime"
                                  value={trainingEditForm.stopTime}
                                  onChange={handleTrainingEditFieldChange}
                                />
                              </label>
                            </div>
                            <label className="logs-field">
                              <span className="logs-label">Dog</span>
                              <select
                                name="dogId"
                                value={trainingEditForm.dogId}
                                onChange={handleTrainingEditFieldChange}
                                disabled={dogsLoading}
                              >
                                <option value="">Select a dog...</option>
                                {dogs.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="logs-item-actions">
                              <button
                                type="button"
                                className="logs-edit-btn"
                                disabled={trainingUpdating}
                                onClick={() => saveTrainingEdit(log.id)}
                              >
                                {trainingUpdating ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                className="logs-cancel-btn"
                                disabled={trainingUpdating}
                                onClick={cancelEditTraining}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="logs-item-body">
                              <div>
                                <strong>Date:</strong> {log.date}
                              </div>
                              <div>
                                <strong>Location:</strong> {log.location}
                              </div>
                              <div>
                                <strong>Time:</strong> {log.time}
                              </div>
                              <div>
                                <strong>Start - Stop:</strong> {log.startTime} - {log.stopTime}
                              </div>
                            </div>
                            <div className="logs-item-actions">
                              {canEditLog(log) && (
                                <>
                                  <button
                                    type="button"
                                    className="logs-edit-btn"
                                    onClick={() => startEditTraining(log)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="logs-delete-btn"
                                    onClick={() => handleDeleteTraining(log.id)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : trainingLogs.length === 0 ? (
                <p className="logs-empty">No training logs yet.</p>
              ) : (
                <div className="logs-list">
                  {trainingLogs.map((log) => (
                    <div key={log.id} className="logs-item">
                      <div className="logs-item-meta">
                        <span className="logs-item-author">
                          {log.dogName ||
                            (dogs.find((d) => d.id === log.dogId)?.name ?? "") ||
                            "Unknown Dog"}
                        </span>
                        <span className="logs-item-timestamp">
                          {formatTimestamp(log.createdAt)}
                        </span>
                      </div>
                      {trainingEditingId === log.id ? (
                        <div className="logs-form logs-edit-form">
                          <label className="logs-field">
                            <span className="logs-label">Date</span>
                            <input
                              type="date"
                              name="date"
                              value={trainingEditForm.date}
                              onChange={handleTrainingEditFieldChange}
                            />
                          </label>
                          <label className="logs-field">
                            <span className="logs-label">Location</span>
                            <input
                              name="location"
                              value={trainingEditForm.location}
                              onChange={handleTrainingEditFieldChange}
                            />
                          </label>
                          <label className="logs-field">
                            <span className="logs-label">Time</span>
                            <input
                              type="time"
                              name="time"
                              value={trainingEditForm.time}
                              onChange={handleTrainingEditFieldChange}
                            />
                          </label>
                          <div className="logs-time-row">
                            <label className="logs-field">
                              <span className="logs-label">Start Time</span>
                              <input
                                type="time"
                                name="startTime"
                                value={trainingEditForm.startTime}
                                onChange={handleTrainingEditFieldChange}
                              />
                            </label>
                            <label className="logs-field">
                              <span className="logs-label">Stop Time</span>
                              <input
                                type="time"
                                name="stopTime"
                                value={trainingEditForm.stopTime}
                                onChange={handleTrainingEditFieldChange}
                              />
                            </label>
                          </div>
                          <label className="logs-field">
                            <span className="logs-label">Dog</span>
                            <select
                              name="dogId"
                              value={trainingEditForm.dogId}
                              onChange={handleTrainingEditFieldChange}
                              disabled={dogsLoading}
                            >
                              <option value="">Select a dog...</option>
                              {dogs.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="logs-item-actions">
                            <button
                              type="button"
                              className="logs-edit-btn"
                              disabled={trainingUpdating}
                              onClick={() => saveTrainingEdit(log.id)}
                            >
                              {trainingUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              className="logs-cancel-btn"
                              disabled={trainingUpdating}
                              onClick={cancelEditTraining}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="logs-item-body">
                            <div>
                              <strong>Date:</strong> {log.date}
                            </div>
                            <div>
                              <strong>Location:</strong> {log.location}
                            </div>
                            <div>
                              <strong>Time:</strong> {log.time}
                            </div>
                            <div>
                              <strong>Start - Stop:</strong> {log.startTime} - {log.stopTime}
                            </div>
                          </div>
                          <div className="logs-item-actions">
                            {canEditLog(log) && (
                              <>
                                <button
                                  type="button"
                                  className="logs-edit-btn"
                                  onClick={() => startEditTraining(log)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="logs-delete-btn"
                                  onClick={() => handleDeleteTraining(log.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
        {/* Search Section */}
        <section className="logs-card logs-search-card">
          <h3>Search {isCommunication ? "Communication" : "Training"} Logs</h3>
          <div className="logs-search-form">
            <div className="logs-search-row">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="logs-search-input"
              />
              <button
                type="button"
                onClick={() => void performSearch()}
                disabled={isSearching}
                className="btn-primary logs-search-btn"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                onClick={clearSearch}
                className="btn-secondary logs-clear-btn"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={toggleSortOrder}
                className="btn-secondary logs-clear-btn"
              >
                Sort: {searchSort === "latest" ? "Latest" : "Oldest"}
              </button>
            </div>

            <div className="logs-filters-row">
              <label className="logs-filter-field">
                <span className="logs-filter-label">Start Date</span>
                <input
                  type="date"
                  name="startDate"
                  value={searchFilters.startDate}
                  onChange={handleFilterChange}
                />
              </label>

              <label className="logs-filter-field">
                <span className="logs-filter-label">End Date</span>
                <input
                  type="date"
                  name="endDate"
                  value={searchFilters.endDate}
                  onChange={handleFilterChange}
                />
              </label>

              {!isCommunication && (
                <label className="logs-filter-field">
                  <span className="logs-filter-label">Dog</span>
                  <select
                    name="dogId"
                    value={searchFilters.dogId}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Dogs</option>
                    {dogs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

            </div>
          </div>
        </section>

        </div>
      </div>
    </>
  );
}
