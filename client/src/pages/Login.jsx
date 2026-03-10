import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser({ email: form.email, password: form.password });
      localStorage.setItem("token", data.token);
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="page-full">
      <div className="card login-box">
        <h2>Login</h2>

        {error && <p className="text-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}