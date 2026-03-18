import { useEffect, useState } from "react";
import {
  createCommunicationLog,
  getCommunicationLogs,
  deleteCommunicationLog,
} from "../services/commLog.js";

export default function LogsPage() {
  // TEMP TEST EVENT ID (no more empty errors)
  const [eventId, setEventId] = useState("test-event-123");

  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("note");
  const [loading, setLoading] = useState(false);

  async function loadLogs() {
    if (!eventId) return;

    try {
      const data = await getCommunicationLogs(eventId);
      setLogs(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load logs");
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!eventId) {
      alert("Event ID is required");
      return;
    }

    if (!message.trim()) {
      alert("Message is required");
      return;
    }

    try {
      setLoading(true);

      await createCommunicationLog({
        eventId,
        message,
        type,
      });

      setMessage("");
      await loadLogs();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCommunicationLog(id);
      loadLogs();
    } catch (err) {
      alert("Failed to delete");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Communications Logs</h2>

      <div>
        <strong>Event ID:</strong> {eventId}
      </div>

      <hr />

      <form onSubmit={handleSubmit}>
        <h3>Add Log</h3>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="note">Note</option>
          <option value="radio">Radio</option>
          <option value="incident">Incident</option>
          <option value="observation">Observation</option>
        </select>

        <br />

        <textarea
          placeholder="Enter message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "300px", height: "80px" }}
        />

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Log"}
        </button>
      </form>

      <hr />

      <h3>Logs</h3>

      {logs.length === 0 && <p>No logs yet</p>}

      {logs.map((log) => (
        <div
          key={log.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>{log.type.toUpperCase()}</strong>

          <p>{log.message}</p>

          <small>
            {new Date(log.createdAt).toLocaleString()}
          </small>

          <br />

          <button onClick={() => handleDelete(log.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}