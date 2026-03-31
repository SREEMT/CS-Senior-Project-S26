import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminUsers,
  deleteAdminUser,
  deleteAdminDog,
  attachDogToUser,
} from "../services/admin";
import { logout } from "../services/auth";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [standaloneDogs, setStandaloneDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingDogId, setDeletingDogId] = useState(null);
  const [attachingDogId, setAttachingDogId] = useState(null);
  const [selectedOwnerByDogId, setSelectedOwnerByDogId] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setMessage(null);
    try {
      const data = await getAdminUsers();
      setUsers(data.users ?? data);
      setStandaloneDogs(data.standaloneDogs ?? []);
    } catch (err) {
      setMessage(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete user "${user.name}" (${user.email})? This cannot be undone.`)) {
      return;
    }
    setDeletingId(user.id);
    setMessage(null);
    try {
      await deleteAdminUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setMessage("User deleted.");
    } catch (err) {
      setMessage(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteDog(dog, ownerUserId) {
    if (!window.confirm(`Delete dog "${dog.name}"? This cannot be undone.`)) {
      return;
    }
    setDeletingDogId(dog.id);
    setMessage(null);
    try {
      await deleteAdminDog(dog.id);
      if (ownerUserId != null) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === ownerUserId
              ? { ...u, dogs: (u.dogs ?? []).filter((d) => d.id !== dog.id) }
              : u
          )
        );
      } else {
        setStandaloneDogs((prev) => prev.filter((d) => d.id !== dog.id));
      }
      setMessage("Dog deleted.");
    } catch (err) {
      setMessage(err.message || "Failed to delete dog");
    } finally {
      setDeletingDogId(null);
    }
  }

  async function handleAttachDog(dogId, ownerUserId) {
    if (!ownerUserId) {
      setMessage("Please select a user first.");
      return;
    }

    const dogName = standaloneDogs.find((d) => d.id === dogId)?.name ?? "this dog";
    if (
      !window.confirm(
        `Attach "${dogName}" to this user? This cannot be undone from this page.`
      )
    ) {
      return;
    }

    setAttachingDogId(dogId);
    setMessage(null);
    try {
      await attachDogToUser(ownerUserId, dogId);
      setSelectedOwnerByDogId((prev) => ({ ...prev, [dogId]: "" }));
      await loadUsers();
      setMessage("Dog attached.");
    } catch (err) {
      setMessage(err.message || "Failed to attach dog");
    } finally {
      setAttachingDogId(null);
    }
  }

  if (loading) {
    return (
      <div className="page-full-column admin-users-page">
        <div className="admin-users-inner">
          <p className="admin-users-loading">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-full-column admin-users-page">
      <div className="admin-users-inner">
        <header className="admin-users-header">
          <h2>Manage Users</h2>
          <div className="admin-users-actions">
            <Link to="/profile" className="btn-secondary">Profile</Link>
            <button type="button" className="btn-secondary btn-logout" onClick={logout}>
              Log out
            </button>
          </div>
        </header>

        {message && (
          <p className="admin-users-message">{message}</p>
        )}

        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Birth date</th>
                <th>Address</th>
                <th>Phone</th>
                <th>CSD #</th>
                <th>Emergency contact</th>
                <th>Emergency phone</th>
                <th>Dogs</th>
                <th>Role</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={12}>No users registered.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.username}</td>
                    <td>{u.birthdate ?? "—"}</td>
                    <td>{u.address ?? "—"}</td>
                    <td>{u.phone ?? "—"}</td>
                    <td>{u.csdnumber ?? "—"}</td>
                    <td>{u.emergencycontact ?? "—"}</td>
                    <td>{u.emergencyphone ?? "—"}</td>
                    <td>
                      <div className="admin-users-dogs">
                        {(u.dogs ?? []).length === 0 ? (
                          "—"
                        ) : (
                          <ul className="admin-users-dogs-list">
                            {(u.dogs ?? []).map((d) => (
                              <li key={d.id} className="admin-users-dog-row">
                                <span title={`${d.color ?? ""} · ${d.vet ?? ""} · ${d.status ?? ""}`.trim() || undefined}>
                                  {d.name}
                                  {(d.color || d.status) && (
                                    <span className="admin-users-dog-meta"> · {[d.color, d.status].filter(Boolean).join(", ")}</span>
                                  )}
                                </span>
                                <button
                                  type="button"
                                  className="btn-delete btn-delete-small"
                                  disabled={deletingDogId === d.id}
                                  onClick={() => handleDeleteDog(d, u.id)}
                                  title={`Delete ${d.name}`}
                                >
                                  {deletingDogId === d.id ? "…" : "Delete"}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </td>
                    <td><span className={`role-badge role-${u.role || "user"}`}>{u.role || "user"}</span></td>
                    <td>
                      <button
                        type="button"
                        className="btn-delete"
                        disabled={deletingId === u.id}
                        onClick={() => handleDelete(u)}
                        title={`Delete ${u.name}`}
                      >
                        {deletingId === u.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {standaloneDogs.length > 0 && (
          <section className="admin-standalone-dogs">
            <h3>Dogs without owner</h3>
            <div className="admin-users-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date of birth</th>
                    <th>Veterinarian</th>
                    <th>Status</th>
                    <th>Color</th>
                    <th>Assign to</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {standaloneDogs.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td>{d.birthDate ? String(d.birthDate).slice(0, 10) : "—"}</td>
                      <td>{d.vet ?? "—"}</td>
                      <td>{d.status ?? "—"}</td>
                      <td>{d.color ?? "—"}</td>
                      <td>
                        <div className="admin-users-attach">
                          <select
                            className="admin-users-assign-select"
                            value={selectedOwnerByDogId[d.id] ?? ""}
                            onChange={(e) =>
                              setSelectedOwnerByDogId((prev) => ({
                                ...prev,
                                [d.id]: e.target.value,
                              }))
                            }
                            disabled={attachingDogId != null}
                            aria-label={`Assign ${d.name} to a user`}
                          >
                            <option value="" disabled>
                              Select user
                            </option>
                            {users.map((u) => (
                              <option value={u.id} key={u.id}>
                                {u.name} ({u.username})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn-primary admin-users-attach-btn"
                            disabled={attachingDogId != null || !selectedOwnerByDogId[d.id]}
                            onClick={() => handleAttachDog(d.id, selectedOwnerByDogId[d.id])}
                          >
                            {attachingDogId === d.id ? "Attaching…" : "Attach"}
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-delete"
                          disabled={deletingDogId === d.id}
                          onClick={() => handleDeleteDog(d, null)}
                          title={`Delete ${d.name}`}
                        >
                          {deletingDogId === d.id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
