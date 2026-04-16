import { useEffect, useMemo, useState } from "react";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
} from "../services/documents";
import { searchItems } from "../services/search.js";
import "./Documents.css";

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchActive, setSearchActive] = useState(false);

  const isAdmin = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    return parseJwt(token)?.role === "admin";
  }, []);

  async function loadDocs() {
    try {
      const data = await getDocuments();
      setDocs(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadDocs();
  }, []);

  async function refreshSearchIfActive() {
    if (!searchActive) return;
    if (
      !searchQuery.trim() &&
      !searchFilters.startDate &&
      !searchFilters.endDate
    ) {
      return;
    }
    setIsSearching(true);
    try {
      const filters = {
        ...searchFilters,
        type: "document",
      };
      const results = await searchItems({ query: searchQuery, filters });
      setSearchResults(results);
    } catch (err) {
      console.error("Search refresh failed:", err);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    try {
      await uploadDocument(formData);

      setTitle("");
      setFile(null);

      await loadDocs();
      await refreshSearchIfActive();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDocument(id);
      await loadDocs();
      await refreshSearchIfActive();
    } catch (err) {
      alert(err.message);
    }
  }

  async function performSearch() {
    if (
      !searchQuery.trim() &&
      !searchFilters.startDate &&
      !searchFilters.endDate
    ) {
      setSearchActive(false);
      return;
    }

    setIsSearching(true);
    try {
      const filters = {
        ...searchFilters,
        type: "document",
      };

      const results = await searchItems({ query: searchQuery, filters });
      setSearchResults(results);
      setSearchActive(true);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchActive(false);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchFilters({
      startDate: "",
      endDate: "",
    });
    setSearchActive(false);
    setSearchResults([]);
  }

  const displayedDocs = (
    searchActive ? searchResults.filter((r) => r.type === "document") : docs
  ).sort((a, b) => {
    const ta = new Date(a.dateAdded || a.createdAt || 0).getTime();
    const tb = new Date(b.dateAdded || b.createdAt || 0).getTime();
    return tb - ta;
  });

  return (
    <div className="page-full-column docs-page">
      <div className="docs-page-inner">
        <header className="docs-header">
          <h2>Documents</h2>
        </header>

        {isAdmin && (
          <section className="docs-card">
            <h3>Upload document</h3>
            <form onSubmit={handleUpload} className="docs-form">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <input
                type="file"
                className="docs-file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />

              <button type="submit">Upload</button>
            </form>
          </section>
        )}

        <section className="docs-card docs-search-card">
          <h3>Search documents</h3>
          <div className="docs-search-form">
            <div className="docs-search-row">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="docs-search-input"
              />
              <button
                type="button"
                onClick={performSearch}
                disabled={isSearching}
                className="btn-primary docs-search-btn"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                onClick={clearSearch}
                className="btn-secondary docs-clear-btn"
              >
                Clear
              </button>
            </div>

            <div className="docs-filters-row">
              <label className="docs-filter-field">
                <span className="docs-filter-label">Start Date</span>
                <input
                  type="date"
                  name="startDate"
                  value={searchFilters.startDate}
                  onChange={handleFilterChange}
                />
              </label>

              <label className="docs-filter-field">
                <span className="docs-filter-label">End Date</span>
                <input
                  type="date"
                  name="endDate"
                  value={searchFilters.endDate}
                  onChange={handleFilterChange}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="docs-card docs-list-card">
          <div className="docs-list-header">
            <h3>Library</h3>
          </div>

          {displayedDocs.length === 0 && (
            <p className="docs-empty">
              {searchActive
                ? "No documents match your search."
                : "No documents uploaded yet."}
            </p>
          )}

          {displayedDocs.length > 0 && (
            <div className="docs-list">
              {displayedDocs.map((doc) => (
                <article key={doc._id || doc.id} className="docs-item">
                  <div className="docs-item-head">
                    <h4 className="docs-item-title">{doc.title}</h4>
                    <span className="docs-item-date">
                      {formatTimestamp(doc.dateAdded || doc.createdAt)}
                    </span>
                  </div>

                  <div className="docs-item-actions">
                    <a
                      className="btn-secondary"
                      href={`/api/documents/${
                        doc._id || doc.id
                      }/file?token=${localStorage.getItem("token")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View PDF
                    </a>
                    {isAdmin && (
                      <button
                        type="button"
                        className="docs-delete-btn"
                        onClick={() => handleDelete(doc._id || doc.id)}
                      >
                        Delete
                      </button>
                    )}
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
