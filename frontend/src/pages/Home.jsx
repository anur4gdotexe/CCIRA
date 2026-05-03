import Tilt from "react-parallax-tilt";
import "./Home.css";

import adminImg from "../assets/Home/AdminLogo.png";
import authorityImg from "../assets/Home/AuthorityLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { MdTrackChanges } from "react-icons/md";
import { IoCreate } from "react-icons/io5";

export default function Home() {
  const navigate = useNavigate();
  
  return (
    <>
      
      <main className="home-page">
        <section className="home-intro glass-panel">
          <div className="home-intro-grid">
            <div>
              <p className="eyebrow">
                Citizen-first complaint management</p>
              <h1>Raise city issues. Track action. Build trust.</h1>
              <p>
                CCIRA helps residents and civic authorities collaborate with
                clarity, transparency, and measurable accountability.
              </p>

              <div className="home-actions">
                <button type="button" className="hero-btn" onClick={() => navigate("/submit")}>
                  Submit a Complaint
                </button>
                {/* <button
                  type="button"
                  className="hero-btn hero-btn-muted"
                  onClick={() => navigate("/track")}
                >
                  Track Existing Complaint
                </button> */}
              </div>
            </div>

            <aside className="intro-metrics" aria-label="Impact metrics">
              <div>
                <span>Response Time</span>
                <strong>24 hrs</strong>
              </div>
              <div>
                <span>Citizen Updates</span>
                <strong>Live Status</strong>
              </div>
              <div>
                <span>Coverage</span>
                <strong>City-wide</strong>
              </div>
            </aside>
          </div>
        </section>

        <section className="cards">
          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
            <div className="login-card" onClick={() => navigate("/login?role=user")}>
              <span className="card-tag">For Citizens</span>
              <img src={authorityImg} alt="Authority" />
              <h3>User Portal</h3>
              <p>Sign in to report, follow, and manage your submitted complaints.</p>
              <span className="card-link">Continue</span>
            </div>
          </Tilt>

          <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
            <div className="login-card" onClick={() => navigate("/login?role=admin")}>
              <span className="card-tag">For Municipal Teams</span>
              <img src={adminImg} alt="Admin" />
              <h3>Admin Portal</h3>
              <p>Monitor incoming issues and update status for public transparency.</p>
              <span className="card-link">Continue</span>
            </div>
          </Tilt>
        </section>

        <section className="banner glass-panel">
          Clean neighborhoods start with one report. Your voice becomes visible action.
        </section>
      </main>

      <footer className="footer glass-panel">
        <div className="footer-col">
          <h3>CCIRA</h3>
          <p>Empowering citizens to build cleaner, safer cities.</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>

          <Link to="/">
            <FaHome className="footer-icon" /> Home
          </Link>

          <Link to="/track">
            <MdTrackChanges className="footer-icon" /> Track Complaint
          </Link>

          <Link to="/submit">
            <IoCreate className="footer-icon" /> Submit Complaint
          </Link>
        </div>

        <div className="footer-col">
          <h4>Stay Updated</h4>
          <a href="#">Subscribe to alerts</a>
        </div>

        <div className="footer-col">
          <h4>Community & Social</h4>

          <a href="#">
            <FaFacebook className="footer-icon" /> Facebook
          </a>
          <a href="#">
            <FaTwitter className="footer-icon" /> Twitter
          </a>
          <a href="#">
            <FaLinkedin className="footer-icon" /> LinkedIn
          </a>
        </div>

        <p className="footer-note">Built for transparent civic collaboration.</p>
      </footer>
      
    </>
  );
}
