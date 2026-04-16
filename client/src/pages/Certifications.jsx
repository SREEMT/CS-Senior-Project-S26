import { useEffect, useMemo, useState } from "react";
import {
  getCertifications,
  uploadCertification,
  deleteCertification
} from "../services/certifications";
import { searchItems } from "../services/search.js";
import "./Certifications.css";

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
    <div className="page-full-column certs-page">
      <div className="certs-page-inner">
        <header className="certs-header">
          <h2>{isAdmin ? "All Certifications" : "My Certifications"}</h2>
        </header>

        <section className="certs-card">
          <h3>Upload Certification</h3>
          <form onSubmit={handleUpload} className="certs-form">
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
              className="certs-file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />

            <button type="submit">Upload</button>
          </form>
        </section>

        <section className="certs-card certs-search-card">
          <h3>Search Certifications</h3>
          <div className="certs-search-form">
            <div className="certs-search-row">
              <input
                type="text"
                placeholder="Search certifications..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="certs-search-input"
              />
              <button
                type="button"
                onClick={performSearch}
                disabled={isSearching}
                className="btn-primary certs-search-btn"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                onClick={clearSearch}
                className="btn-secondary certs-clear-btn"
              >
                Clear
              </button>
            </div>

            <div className="certs-filters-row">
              <label className="certs-filter-field">
                <span className="certs-filter-label">Start Date</span>
                <input
                  type="date"
                  name="startDate"
                  value={searchFilters.startDate}
                  onChange={handleFilterChange}
                />
              </label>

              <label className="certs-filter-field">
                <span className="certs-filter-label">End Date</span>
                <input
                  type="date"
                  name="endDate"
                  value={searchFilters.endDate}
                  onChange={handleFilterChange}
                />
              </label>
            </div>
          </div>

          {isAdmin && (
            <div className="certs-admin-filter">
              <label className="certs-filter-field certs-filter-field-wide">
                <span className="certs-filter-label">Filter by user</span>
                <select
                  value={adminUserFilter}
                  onChange={(e) => setAdminUserFilter(e.target.value)}
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
        </section>

        <section className="certs-card certs-list-card">
          <div className="certs-list-header">
            <h3>{isAdmin ? "All Certifications" : "Your Certifications"}</h3>
          </div>

          {displayedCerts.length === 0 && (
            <p className="certs-empty">
              {useSearch ? "No certifications match your search." : "No certifications uploaded."}
            </p>
          )}

          {displayedCerts.length > 0 && (
            <div className="certs-list">
              {displayedCerts.map((cert) => (
                <article key={cert._id || cert.id} className="certs-item">
                  <div className="certs-item-head">
                    <h4 className="certs-item-title">{cert.title}</h4>
                    <span className="certs-item-date">
                      {formatDateAdded(cert.dateAdded || cert.createdAt)}
                    </span>
                  </div>
                  <div className="certs-item-meta">
                    <p>
                      <strong>Issuer:</strong> {cert.issuer || "N/A"}
                    </p>
                    <p>
                      <strong>User:</strong> {cert.userName || "Unknown User"}
                    </p>
                  </div>

                  <div className="certs-item-actions">
                    <a
                      className="btn-secondary"
                      href={`/api/certifications/${cert._id || cert.id}/file?token=${localStorage.getItem("token")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View PDF
                    </a>
                    <button
                      type="button"
                      className="certs-delete-btn"
                      onClick={() => handleDelete(cert._id || cert.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Certifications;
