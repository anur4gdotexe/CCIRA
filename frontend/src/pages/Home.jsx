import Tilt from "react-parallax-tilt";
import "./Home.css";

import adminImg from "../assets/Home/AdminLogo.png";
import authorityImg from "../assets/Home/AuthorityLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { MdTrackChanges } from "react-icons/md";
import { IoCreate } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import API from "../services/api";

// ── Count-up animation ──
function CountUp({ target, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setDisplay(0); return; }
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return <>{display}{suffix}</>;
}

// ── Donut chart — pure SVG ──
function DonutChart({ segments, size = 160, thickness = 26 }) {
  const r    = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const cx   = size / 2;
  const cy   = size / 2;

  let offset = 0;
  const slices = segments.map((seg) => {
    const dash  = (seg.pct / 100) * circ;
    const gap   = circ - dash;
    const slice = { ...seg, dash, gap, offset };
    offset += dash;
    return slice;
  });

  const resolvedPct = segments.find((s) => s.label === "Resolved")?.pct ?? 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgba(108,92,70,0.1)" strokeWidth={thickness} />
      {slices.map((s) => (
        <circle
          key={s.label}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="butt"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            animation: "donut-in 0.9s ease-out both",
          }}
        />
      ))}
      <text
        x={cx} y={cy - 6}
        textAnchor="middle"
        style={{ fontSize: 22, fontWeight: 700, fill: "#2f2a24", fontFamily: "Sora, sans-serif" }}
      >
        {resolvedPct}%
      </text>
      <text
        x={cx} y={cy + 14}
        textAnchor="middle"
        style={{ fontSize: 9, fontWeight: 700, fill: "#7b6c59",
                 letterSpacing: "0.08em", textTransform: "uppercase" }}
      >
        RESOLVED
      </text>
    </svg>
  );
}

// ── Vertical bar chart — pure SVG ──
function BarChart({ bars, height = 120 }) {
  const max    = Math.max(...bars.map((b) => b.value), 1);
  const bw     = 28;
  const gap    = 18;
  const padX   = 10;
  const padY   = 10;
  const labelH = 22;
  const totalW = bars.length * (bw + gap) - gap + padX * 2;
  const chartH = height + padY + labelH;

  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${chartH}`} aria-hidden="true"
      style={{ overflow: "visible" }}>
      {bars.map((b, i) => {
        const barH = Math.max((b.value / max) * height, b.value > 0 ? 4 : 0);
        const x    = padX + i * (bw + gap);
        const y    = padY + height - barH;
        return (
          <g key={b.label}>
            <rect
              x={x} y={y} width={bw} height={barH} rx={5} fill={b.color}
              style={{
                animation: `bar-rise 0.7s ${i * 0.08}s ease-out both`,
                transformOrigin: `${x + bw / 2}px ${padY + height}px`,
              }}
            />
            {b.value > 0 && (
              <text
                x={x + bw / 2} y={y - 5}
                textAnchor="middle"
                style={{ fontSize: 10, fontWeight: 700, fill: "#2f2a24" }}
              >
                {b.value}
              </text>
            )}
            <text
              x={x + bw / 2} y={padY + height + labelH - 4}
              textAnchor="middle"
              style={{ fontSize: 9.5, fontWeight: 700, fill: "#7b6c59" }}
            >
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [publicStats, setPublicStats] = useState(null);

  useEffect(() => {
    API.get("/complaints/public")
      .then((res) => {
        const list      = Array.isArray(res.data) ? res.data : [];
        const total     = list.length;
        const resolved  = list.filter((c) => c.status === "RESOLVED").length;
        const accepted  = list.filter((c) => c.status === "ACCEPTED").length;
        const submitted = list.filter((c) => c.status === "SUBMITTED").length;
        const declined  = list.filter((c) => c.status === "DECLINED").length;
        const rate      = total > 0 ? Math.round((resolved / total) * 100) : 0;

        const donutSegments = total > 0
          ? [
              { label: "Resolved",  pct: Math.round((resolved  / total) * 100), color: "#4a7c59" },
              { label: "Accepted",  pct: Math.round((accepted  / total) * 100), color: "#3a82c4" },
              { label: "Submitted", pct: Math.round((submitted / total) * 100), color: "#c49a3a" },
              { label: "Declined",  pct: Math.round((declined  / total) * 100), color: "#c0392b" },
            ].filter((s) => s.pct > 0)
          : [];

        const catColors = { ROAD: "#a08060", WATER: "#3a82c4", WASTE: "#4a7c59", SEWAGE: "#c49a3a" };
        const catBars = ["ROAD", "WATER", "WASTE", "SEWAGE"].map((cat) => ({
          label: cat.charAt(0) + cat.slice(1).toLowerCase(),
          value: list.filter((c) => c.category === cat).length,
          color: catColors[cat],
        }));

        setPublicStats({ total, resolved, accepted, submitted, declined, rate, donutSegments, catBars });
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <main className="home-page">

        {/* ── Hero ── */}
        <section className="home-intro glass-panel">
          <div className="home-intro-grid">
            <div>
              <p className="eyebrow">Citizen-first complaint management</p>
              <h1>Raise city issues. Track action. Build trust.</h1>
              <p>
                CCIRA helps residents and civic authorities collaborate with
                clarity, transparency, and measurable accountability.
              </p>
              <div className="home-actions">
                <button type="button" className="hero-btn" onClick={() => navigate("/submit")}>
                  Submit a Complaint
                </button>
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

        {/* ── Live stats strip ── */}
        {publicStats && (
          <section className="home-stats" aria-label="Live platform statistics">
            <div className="home-stats-header">
              <span className="home-stats-live">
                <span className="live-dot" aria-hidden="true" />
                Live
              </span>
              <span className="home-stats-title">Platform Stats</span>
            </div>

            <div className="home-stats-grid">
              <div className="home-stat-card home-stat-card--total">
                <span className="home-stat-icon">📋</span>
                <strong className="home-stat-number"><CountUp target={publicStats.total} /></strong>
                <span className="home-stat-label">Total Complaints</span>
                <div className="home-stat-bar-track">
                  <div className="home-stat-bar home-stat-bar--total" style={{ "--bar-pct": "100%" }} />
                </div>
              </div>

              <div className="home-stat-card home-stat-card--resolved">
                <span className="home-stat-icon">✅</span>
                <strong className="home-stat-number"><CountUp target={publicStats.resolved} /></strong>
                <span className="home-stat-label">Resolved</span>
                <div className="home-stat-bar-track">
                  <div className="home-stat-bar home-stat-bar--resolved"
                    style={{ "--bar-pct": `${publicStats.total > 0 ? (publicStats.resolved / publicStats.total) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="home-stat-card home-stat-card--accepted">
                <span className="home-stat-icon">🔄</span>
                <strong className="home-stat-number"><CountUp target={publicStats.accepted} /></strong>
                <span className="home-stat-label">In Progress</span>
                <div className="home-stat-bar-track">
                  <div className="home-stat-bar home-stat-bar--accepted"
                    style={{ "--bar-pct": `${publicStats.total > 0 ? (publicStats.accepted / publicStats.total) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="home-stat-card home-stat-card--submitted">
                <span className="home-stat-icon">📬</span>
                <strong className="home-stat-number"><CountUp target={publicStats.submitted} /></strong>
                <span className="home-stat-label">Awaiting Review</span>
                <div className="home-stat-bar-track">
                  <div className="home-stat-bar home-stat-bar--submitted"
                    style={{ "--bar-pct": `${publicStats.total > 0 ? (publicStats.submitted / publicStats.total) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="home-stat-card home-stat-card--rate">
                <span className="home-stat-icon">📈</span>
                <strong className="home-stat-number"><CountUp target={publicStats.rate} suffix="%" /></strong>
                <span className="home-stat-label">Resolution Rate</span>
                <div className="home-stat-bar-track">
                  <div className="home-stat-bar home-stat-bar--rate"
                    style={{ "--bar-pct": `${publicStats.rate}%` }} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Charts row ── */}
        {publicStats && publicStats.total > 0 && (
          <section className="home-charts" aria-label="Complaint analytics">

            <div className="home-chart-card">
              <p className="home-chart-title">Status Breakdown</p>
              <div className="home-chart-donut-wrap">
                <DonutChart segments={publicStats.donutSegments} size={160} thickness={26} />
                <ul className="donut-legend">
                  {publicStats.donutSegments.map((s) => (
                    <li key={s.label}>
                      <span className="donut-legend-dot" style={{ background: s.color }} />
                      <span className="donut-legend-label">{s.label}</span>
                      <span className="donut-legend-pct">{s.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="home-chart-card">
              <p className="home-chart-title">Complaints by Category</p>
              <div className="home-chart-bar-wrap">
                <BarChart bars={publicStats.catBars} height={110} />
              </div>
            </div>

          </section>
        )}

        {/* ── Portal cards ── */}
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
          <Link to="/"><FaHome className="footer-icon" /> Home</Link>
          <Link to="/track"><MdTrackChanges className="footer-icon" /> Track Complaint</Link>
          <Link to="/submit"><IoCreate className="footer-icon" /> Submit Complaint</Link>
        </div>

        <div className="footer-col">
          <h4>Stay Updated</h4>
          <a href="#">Subscribe to alerts</a>
        </div>

        <div className="footer-col">
          <h4>Community &amp; Social</h4>
          <a href="#"><FaFacebook className="footer-icon" /> Facebook</a>
          <a href="#"><FaTwitter className="footer-icon" /> Twitter</a>
          <a href="#"><FaLinkedin className="footer-icon" /> LinkedIn</a>
        </div>

        <p className="footer-note">Built for transparent civic collaboration.</p>
      </footer>
    </>
  );
}
