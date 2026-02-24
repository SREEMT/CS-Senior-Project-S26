import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminUsers, deleteAdminUser } from "../services/admin";
import { logout } from "../services/auth";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setMessage(null);
    try {
      const data = await getAdminUsers();
      setUsers(data);
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

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="admin-users-inner">
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-inner">
        <header className="admin-users-header">
          <h2>Manage Users</h2>
          <div className="admin-users-actions">
            <Link to="/profile" className="btn-link">Profile</Link>
            <button type="button" className="btn-logout" onClick={logout}>
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
                <th>Role</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={11}>No users registered.</td>
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
      </div>
    </div>
  );
}
