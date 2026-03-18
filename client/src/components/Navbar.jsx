import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img
          src="/csdlogo.png"
          alt="Chesapeake Search Dogs"
          className="navbar-logo"
        />
        <span className="navbar-brand">CSD Central</span>
      </div>
      <ul className="navbar-links">
        <li>
          <span className="navbar-link-placeholder">Home</span>
        </li>
        <li>
          <Link to="/calendar" className="navbar-link">
            Calendar
          </Link>
        </li>
        <li>
          <span className="navbar-link-placeholder">Certifications</span>
        </li>
        <li>
          <Link to="/logs" className="navbar-link">Logs</Link>
        </li>
        <li>
          <Link to="/profile" className="navbar-link">
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}
