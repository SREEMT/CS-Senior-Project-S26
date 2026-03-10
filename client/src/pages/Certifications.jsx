import { useEffect, useState } from "react";
import {
  getCertifications,
  uploadCertification,
  deleteCertification
} from "../services/certifications";

function Certifications() {
  const [certs, setCerts] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");

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

  return (
    <div style={{ padding: "30px" }}>
      <h1>My Certifications</h1>

      <h2>Upload Certification</h2>

      <form onSubmit={handleUpload}>
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
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <button type="submit">Upload</button>
      </form>

      <hr />

      <h2>Your Certifications</h2>

      {certs.length === 0 && <p>No certifications uploaded.</p>}

      {certs.map((cert) => (
        <div
          key={cert._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <h3>{cert.title}</h3>
          <p>Issuer: {cert.issuer || "N/A"}</p>

          <a
            href={`http://localhost:3049/api/certifications/${cert._id}/file`}
            target="_blank"
          >
            View PDF
          </a>

          <br />

          <button onClick={() => handleDelete(cert._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default Certifications;