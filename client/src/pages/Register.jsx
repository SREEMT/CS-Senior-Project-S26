import { useState } from "react";
import { registerUser, registerDog } from "../services/auth";
import "./Register.css";

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

  const [dogForm, setDogForm] = useState({
    name: "",
    dateOfBirth: "",
    veterinarian: "",
    status: "",
    color: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dogError, setDogError] = useState("");
  const [dogSuccess, setDogSuccess] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleDogChange(e) {
    setDogForm({
      ...dogForm,
      [e.target.name]: e.target.value,
    });
  }

  async function submitRegistration(includeDog) {
    setError("");
    setSuccess("");
    setDogError("");
    setDogSuccess("");

    const payload = { ...form };
    if (includeDog && dogForm.name.trim()) {
      payload.dog = {
        name: dogForm.name.trim(),
        dateOfBirth: dogForm.dateOfBirth || undefined,
        veterinarian: dogForm.veterinarian.trim(),
        status: dogForm.status.trim(),
        color: dogForm.color.trim(),
      };
    }

    try {
      await registerUser(payload);
      setSuccess(
        includeDog && dogForm.name.trim()
          ? "Account and dog registered successfully!"
          : "Account created successfully!"
      );
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
      setDogForm({
        name: "",
        dateOfBirth: "",
        veterinarian: "",
        status: "",
        color: "",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await submitRegistration(false);
  }

  async function handleDogSubmit(e) {
    e.preventDefault();
    setDogError("");
    setDogSuccess("");

    try {
      await registerDog({
        name: dogForm.name.trim(),
        dateOfBirth: dogForm.dateOfBirth || undefined,
        veterinarian: dogForm.veterinarian.trim(),
        status: dogForm.status.trim(),
        color: dogForm.color.trim(),
      });
      setDogSuccess("Dog registered successfully!");
      setDogForm({
        name: "",
        dateOfBirth: "",
        veterinarian: "",
        status: "",
        color: "",
      });
    } catch (err) {
      setDogError(err.message);
    }
  }

  return (
    <div className="page-full">
      <div className="card register-box">
        <h2>Create Account</h2>

        {error && <p className="text-error">{error}</p>}
        {success && <p className="text-success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
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

      <div className="card register-box">
        <h2>Register Dog Account</h2>

        {dogError && <p className="text-error">{dogError}</p>}
        {dogSuccess && <p className="text-success">{dogSuccess}</p>}

        <form onSubmit={handleDogSubmit}>
          <input
            name="name"
            placeholder="Dog Name"
            value={dogForm.name}
            onChange={handleDogChange}
            required
          />
          <input
            type="date"
            name="dateOfBirth"
            value={dogForm.dateOfBirth}
            onChange={handleDogChange}
            required
          />
          <input
            name="veterinarian"
            placeholder="Veterinarian"
            value={dogForm.veterinarian}
            onChange={handleDogChange}
            required
          />
          <input
            name="status"
            placeholder="Status"
            value={dogForm.status}
            onChange={handleDogChange}
            required
          />
          <input
            name="color"
            placeholder="Color"
            value={dogForm.color}
            onChange={handleDogChange}
            required
          />

          <button type="submit">Register Dog</button>
        </form>
      </div>
    </div>
  );
}