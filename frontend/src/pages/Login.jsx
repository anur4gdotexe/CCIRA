import React, { useState } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import API from "../services/api";
import "./Login.css";
import { useAuth } from "../context/AuthContext";

import LeftHalf from "../assets/LoginPage/LeftHalf.png";

const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const roleFromQuery = (searchParams.get("role") || "user").toLowerCase();
  const isAdminFlow = roleFromQuery === "admin";
  const redirectTo = location.state?.from || (isAdminFlow ? "/admin" : "/submit");

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {

      const res = await API.post("/auth/login", {
        userId,
        password
      });

      login({
        token: res.data
      });

      navigate(redirectTo, { replace: true });

    } catch (error) {
      setErrorMessage(error.userMessage || "Invalid user ID or password");

    } finally {
      setIsSubmitting(false);
    }

  };

  return (

    <div className="auth-page">

         {/* HOME BUTTON */}
      <Link to="/" className="home-btn">← Home</Link>

      {/* LEFT PANEL */}

<div className="auth-left">

  <div className="left-content">

    <div className="brand">● CCIRA</div>

    <h1>Manage civic complaints easily</h1>

    <p>
      Submit and track public issues to help improve your city.
    </p>

    <img src={LeftHalf} className="side-image" alt="Illustration of civic issue reporting" />

  </div>

</div>

      {/* RIGHT PANEL */}

      <div className="auth-right">

        <div className="auth-card">

          <h2>{isAdminFlow ? "Admin Sign In" : "Sign In"}</h2>

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <form onSubmit={handleLogin}>

            <label>User ID</label>

            <input
              type="userId"
              placeholder="Enter User ID"
              onChange={(e)=>setUserId(e.target.value)}
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              onChange={(e)=>setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>

          </form>

          <p className="switch-auth">
            Don't have an account?
            <Link to={isAdminFlow ? "/register?role=admin" : "/register?role=user"}> Sign Up</Link>
          </p>

        </div>

      </div>

    </div>

  );

};

export default Login;