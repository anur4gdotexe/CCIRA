import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

import RightHalf from "../assets/LoginPage/RightHalf.png";

const Register = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromQuery = (searchParams.get("role") || "user").toLowerCase();
  const resolvedRole = roleFromQuery === "admin" ? "admin" : "user";
  const isAdminFlow = resolvedRole === "admin";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await API.post("/auth/register", {
        ...form,
        role: resolvedRole
      });

      alert("Registration successful");

      navigate(isAdminFlow ? "/login?role=admin" : "/login?role=user");

    } catch (error) {

      const message = error?.response?.data?.message || "Registration failed";
      alert(message);

    }

  };

  return (

    <div className="auth-page register-page">

       {/* HOME BUTTON */}
      <Link to="/" className="home-btn">← Home</Link>

      {/* LEFT PANEL (FORM) */}

      <div className="auth-right">

        <div className="auth-card">

          <h2>{isAdminFlow ? "Admin Register" : "Register"}</h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <button type="submit">
              Register
            </button>

          </form>

          <p className="switch-auth">
            Already have an account?
            <Link to={isAdminFlow ? "/login?role=admin" : "/login?role=user"}> Sign In</Link>
          </p>

        </div>

      </div>

      {/* RIGHT PANEL */}

      <div className="auth-left">

        <div className="left-content">

          <div className="brand">● CivicVoice</div>

          <h1>Join CivicVoice today</h1>

          <p>
            Create an account to submit and track civic complaints easily.
          </p>

          <img src={RightHalf} className="side-image" alt="Illustration of community participation" />

        </div>

      </div>

    </div>

  );

};

export default Register;