import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const token = getToken();

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:3049/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        setUser(data);
        setForm(data);
      } catch {
        setMessage("Failed to load user");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [token]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(
        `http://localhost:3049/api/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();
      setUser(data);
      setMessage("Profile updated!");
    } catch {
      setMessage("Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h2>My Profile</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          placeholder="Name"
        />

        <input
          name="email"
          value={form.email || ""}
          onChange={handleChange}
          placeholder="Email"
        />

        <input
          name="phone"
          value={form.phone || ""}
          onChange={handleChange}
          placeholder="Phone"
        />

        <input
          name="address"
          value={form.address || ""}
          onChange={handleChange}
          placeholder="Address"
        />

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
