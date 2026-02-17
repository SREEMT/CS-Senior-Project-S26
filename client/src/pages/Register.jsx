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
    csdnumber: "",
    emergencycontact: "",
    emergencyphone: "",
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
        csdnumber: "",
        emergencycontact: "",
        emergencyphone: "",
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
        <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} required />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
        <input name="csdnumber" placeholder="CSD Number" value={form.csdnumber} onChange={handleChange} required />
        <input name="emergencycontact" placeholder="Emergency Contact" value={form.emergencycontact} onChange={handleChange} required />
        <input name="emergencyphone" placeholder="Emergency Phone" value={form.emergencyphone} onChange={handleChange} required />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}