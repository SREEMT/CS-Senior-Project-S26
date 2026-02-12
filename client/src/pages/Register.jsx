import { useState } from "react";
import { registerUser } from "../services/auth";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    birthdate: "",
    address: "",
    phone: "",
    csdNumber: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await registerUser(form);
      setSuccess("Account created successfully!");
      setForm({
        name: "",
        email: "",
        username: "",
        password: "",
        birthdate: "",
        address: "",
        phone: "",
        csdNumber: "",
        emergencyContact: "",
        emergencyPhone: "",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Create Account</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="csdNumber" placeholder="CSD Number" value={form.csdNumber} onChange={handleChange} />
        <input name="emergencyContact" placeholder="Emergency Contact" value={form.emergencyContact} onChange={handleChange} />
        <input name="emergencyPhone" placeholder="Emergency Phone" value={form.emergencyPhone} onChange={handleChange} />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}