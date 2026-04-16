import { useEffect, useMemo, useState } from "react";
import {
  getCertifications,
  uploadCertification,
  deleteCertification
} from "../services/certifications";
import { searchItems } from "../services/search.js";

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function formatDateAdded(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString();
}

function Certifications() {
  const [certs, setCerts] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const [adminUserFilter, setAdminUserFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [useSearch, setUseSearch] = useState(false);
  const isAdmin = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    return parseJwt(token)?.role === "admin";
  }, []);

  async function loadCerts() {
    try {
      const data = await getCertifications();
      setCerts(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadCerts();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("issuer", issuer);

    try {
      await uploadCertification(formData);

      setTitle("");
      setIssuer("");
      setFile(null);

      loadCerts();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCertification(id);
      loadCerts();
    } catch (err) {
      alert(err.message);
    }
  }

  // Search functions
  async function performSearch() {
    if (!searchQuery.trim() && !searchFilters.startDate && !searchFilters.endDate) {
      setUseSearch(false);
      return;
    }

    setIsSearching(true);
    try {
      const filters = {
        ...searchFilters,
        type: "certification",
      };

      const results = await searchItems({ query: searchQuery, filters });
      setSearchResults(results);
      setUseSearch(true);
    } catch (err) {
      console.error("Search failed:", err);
      setUseSearch(false);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchFilters({
      startDate: "",
      endDate: "",
    });
    setAdminUserFilter("all");
    setUseSearch(false);
    setSearchResults([]);
  }

  const adminUserOptions = useMemo(() => {
    const source = useSearch
      ? searchResults.filter((r) => r.type === "certification")
      : certs;

    const map = new Map();
    for (const cert of source) {
      const userId = cert.userId ? String(cert.userId) : "";
      if (!userId) continue;
      if (!map.has(userId)) {
        map.set(userId, cert.userName || "Unknown User");
      }
    }

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [certs, searchResults, useSearch]);

  // Get displayed certifications
  const displayedCerts = (useSearch ? searchResults.filter(r => r.type === "certification") : certs)
    .filter((cert) => {
      if (!isAdmin || adminUserFilter === "all") return true;
      return String(cert.userId || "") === adminUserFilter;
    });

  return (
    <div style={{ padding: "30px" }}>
      <h1>{isAdmin ? "All Certifications" : "My Certifications"}</h1>

      <h2>Upload Certification</h2>

      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Issuer"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <button type="submit">Upload</button>
      </form>

      <hr />

      <h2>Search Certifications</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search certifications..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ marginRight: "10px", padding: "5px" }}
        />

        <label style={{ marginRight: "10px" }}>
          Start Date:
          <input
            type="date"
            name="startDate"
            value={searchFilters.startDate}
            onChange={handleFilterChange}
            style={{ marginLeft: "5px", padding: "5px" }}
          />
        </label>

        <label style={{ marginRight: "10px" }}>
          End Date:
          <input
            type="date"
            name="endDate"
            value={searchFilters.endDate}
            onChange={handleFilterChange}
            style={{ marginLeft: "5px", padding: "5px" }}
          />
        </label>

        <button
          onClick={performSearch}
          disabled={isSearching}
          style={{ marginRight: "10px", padding: "5px 10px" }}
        >
          {isSearching ? "Searching..." : "Search"}
        </button>

        <button
          onClick={clearSearch}
          style={{ padding: "5px 10px" }}
        >
          Clear
        </button>
      </div>

      {isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <label>
            Filter by user:
            <select
              value={adminUserFilter}
              onChange={(e) => setAdminUserFilter(e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
            >
              <option value="all">All Users</option>
              {adminUserOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <hr />

      <h2>{isAdmin ? "All Certifications" : "Your Certifications"}</h2>

      {displayedCerts.length === 0 && (
        <p>{useSearch ? "No certifications match your search." : "No certifications uploaded."}</p>
      )}

      {displayedCerts.map((cert) => (
        <div
          key={cert._id || cert.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <h3>{cert.title}</h3>
          <p>Issuer: {cert.issuer || "N/A"}</p>
          <p>User: {cert.userName || "Unknown User"}</p>
          <p>Date Added: {formatDateAdded(cert.dateAdded || cert.createdAt)}</p>

          <a
            href={`/api/certifications/${cert._id || cert.id}/file?token=${localStorage.getItem("token")}`}
            target="_blank"
          >
            View PDF
          </a>

          <br />

          <button onClick={() => handleDelete(cert._id || cert.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default Certifications;
