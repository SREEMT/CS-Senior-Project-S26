import { Outlet, Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth";
import Navbar from "./Navbar";

export default function AuthenticatedLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
