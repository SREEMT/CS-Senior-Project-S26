import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getToken, isAuthenticated } from "../services/auth";

export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setAllowed(false);
      return;
    }
    const token = getToken();
    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAllowed(data.role === "admin");
      })
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  if (!allowed) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
