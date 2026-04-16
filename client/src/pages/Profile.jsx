import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken, logout } from "../services/auth";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const token = getToken();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setUser(data);
        setForm({
          name: data.name ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          emergencyContact: data.emergencycontact ?? data.emergencyContact ?? "",
          emergencyPhone: data.emergencyphone ?? data.emergencyPhone ?? "",
        });
      } catch {
        setMessage("Failed to load profile");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [token]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setUser({ ...user, ...data });
      setMessage("Profile updated!");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message || "Update failed");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-full-column profile-page">
        <div className="profile-page-inner">
          <p className="profile-loading">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-full-column profile-page">
        <div className="profile-page-inner">
          <p className="text-error">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-full-column profile-page">
      <div className="profile-page-inner">
        <header className="profile-header">
          <h2>My Profile</h2>
          <div className="profile-header-actions">
            {(user.role === "admin") && (
              <Link to="/admin/users" className="btn-secondary">Manage users</Link>
            )}
            <button type="button" className="btn-secondary btn-logout" onClick={logout}>
              Log out
            </button>
          </div>
        </header>

        {message && (
          <p className={`profile-message ${messageType}`}>{message}</p>
        )}

        <section className="profile-card">
        <h3>Account info</h3>
        <div className="profile-row">
          <strong>Name</strong> {user.name}
        </div>
        <div className="profile-row">
          <strong>Email</strong> {user.email}
        </div>
        <div className="profile-row">
          <strong>Username</strong> {user.username}
        </div>
        {user.birthdate && (
          <div className="profile-row">
            <strong>Birth date</strong> {user.birthdate}
          </div>
        )}
        {user.csdnumber && (
          <div className="profile-row">
            <strong>CSD number</strong> {user.csdnumber}
          </div>
        )}
      </section>

      <section className="profile-card">
        <h3>Edit profile</h3>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
          <input
            name="emergencyContact"
            value={form.emergencyContact}
            onChange={handleChange}
            placeholder="Emergency contact"
          />
          <input
            name="emergencyPhone"
            value={form.emergencyPhone}
            onChange={handleChange}
            placeholder="Emergency phone"
          />
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>
      </div>
    </div>
  );
}
