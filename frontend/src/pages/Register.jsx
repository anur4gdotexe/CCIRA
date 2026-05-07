import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

import RightHalf from "../assets/LoginPage/RightHalf.png";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromQuery = (searchParams.get("role") || "user").toLowerCase();
  const isAdminFlow = roleFromQuery === "admin";

  // Step 1 form fields
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  // Step 2 OTP
  const [step, setStep] = useState(1); // 1 = fill form, 2 = enter OTP, 3 = success
  const [otp, setOtp] = useState("");
  const [generatedUserId, setGeneratedUserId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1 — send OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await API.post("/auth/register", form);
      setStep(2);
    } catch (error) {
      setErrorMessage(error.userMessage || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 — verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await API.post("/auth/verify-otp", { ...form, otp });
      setGeneratedUserId(res.data.userId);
      setStep(3);
    } catch (error) {
      setErrorMessage(error.userMessage || "Invalid or expired OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <Link to="/" className="home-btn">← Home</Link>

      {/* FORM PANEL */}
      <div className="auth-right">
        <div className="auth-card">

          {/* ── Step 1: Registration form ── */}
          {step === 1 && (
            <>
              <h2>{isAdminFlow ? "Admin Register" : "Register"}</h2>
              {errorMessage && <p className="auth-error">{errorMessage}</p>}

              <form onSubmit={handleRegister}>
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />

                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending OTP..." : "Continue"}
                </button>
              </form>

              <p className="switch-auth">
                Already have an account?
                <Link to={isAdminFlow ? "/login?role=admin" : "/login?role=user"}> Sign In</Link>
              </p>
            </>
          )}

          {/* ── Step 2: OTP verification ── */}
          {step === 2 && (
            <>
              <h2>Verify your email</h2>
              <p className="auth-subtext">
                We sent a 6-digit code to <strong>{form.email}</strong>. Enter it below.
              </p>
              {errorMessage && <p className="auth-error">{errorMessage}</p>}

              <form onSubmit={handleVerifyOtp}>
                <label>OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Verify & Create Account"}
                </button>
              </form>

              <p className="switch-auth">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => { setStep(1); setErrorMessage(""); }}
                >
                  ← Back
                </button>
              </p>
            </>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="auth-success">
              <h2>You're in! 🎉</h2>
              <p>Your account has been created successfully.</p>

              <div className="user-id-box">
                <span className="user-id-label">Your User ID</span>
                <span className="user-id-value">{generatedUserId}</span>
              </div>

              <p className="auth-subtext">
                Save this ID — you'll need it to log in along with your email or password.
              </p>

              <button
                type="button"
                onClick={() => navigate(isAdminFlow ? "/login?role=admin" : "/login?role=user")}
              >
                Go to Login
              </button>
            </div>
          )}

        </div>
      </div>

      {/* BRANDING PANEL */}
      <div className="auth-left">
        <div className="left-content">
          <div className="brand">● CCIRA</div>
          <h1>Join CCIRA today</h1>
          <p>Create an account to submit and track civic complaints easily.</p>
          <img src={RightHalf} className="side-image" alt="Illustration of community participation" />
        </div>
      </div>
    </div>
  );
};

export default Register;
