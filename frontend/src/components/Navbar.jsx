import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
    <nav className="navbar">

      <div className="logo">
        <span className="logo-icon">C</span>
        <span className="logo-text">CCIRA</span>
      </div>

      <div className="nav-links">
        {(user?.role === "user") && (
          <Link to="/track">Track Complaint</Link>
        )}
        {(user?.role === "user") && (
          <Link to="/submit">Submit Complaint</Link>
        )}
        
        {(user?.role === "admin") && (
          <Link to="/admin">Admin Dashboard</Link>
        )}
        {isAuthenticated ? (
          <button type="button" onClick={handleLogout} className="nav-action-btn">
            Logout
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>

    </nav>
    <div className="navbar-offset" aria-hidden="true"></div>
    </>
  );
}