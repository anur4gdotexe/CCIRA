import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

const BACKEND_ORIGIN = (import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:5001").replace(/\/$/, "");

const resolveComplaintImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND_ORIGIN}/${normalizedPath}`;
};

const STATUS_CHIP_CLASS = {
  SUBMITTED: "status-submitted",
  ACCEPTED:  "status-accepted",
  DECLINED:  "status-declined",
  RESOLVED:  "status-resolved",
};

// Which actions are available per current status
const NEXT_ACTIONS = {
  SUBMITTED: [
    { label: "Accept",  value: "ACCEPTED" },
    { label: "Decline", value: "DECLINED" },
  ],
  ACCEPTED: [
    { label: "Mark Resolved", value: "RESOLVED" },
    { label: "Decline",       value: "DECLINED" },
  ],
  DECLINED: [],
  RESOLVED: [],
};

function StatusDropdown({ complaintId, currentStatus, onUpdate }) {
  const actions = NEXT_ACTIONS[currentStatus] ?? [];
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.right + window.scrollX,
      });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const ACTION_CLASS = {
    ACCEPTED: "dropdown-option--accept",
    RESOLVED: "dropdown-option--resolve",
    DECLINED: "dropdown-option--decline",
  };

  // Terminal states — just a plain chip
  if (actions.length === 0) {
    return (
      <span className={`admin-status-chip ${STATUS_CHIP_CLASS[currentStatus] || ""}`}>
        {currentStatus}
      </span>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        className={`admin-status-chip admin-status-chip--clickable ${STATUS_CHIP_CLASS[currentStatus] || ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currentStatus}
        <svg
          className={`dropdown-chevron ${open ? "dropdown-chevron--open" : ""}`}
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && createPortal(
        <ul
          ref={menuRef}
          className="admin-dropdown-menu"
          role="listbox"
          style={{
            position: "absolute",
            top: menuPos.top,
            left: menuPos.left,
            transform: "translateX(-100%)",
          }}
        >
          {actions.map((a) => (
            <li
              key={a.value}
              role="option"
              className={`admin-dropdown-option ${ACTION_CLASS[a.value] || ""}`}
              onClick={() => {
                setOpen(false);
                onUpdate(complaintId, a.value);
              }}
            >
              {a.label}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </>
  );
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await API.get("/complaints/admins");
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching complaints", error);
      setErrorMessage(error.userMessage || "Unable to load submitted complaints.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await API.patch(`/complaints/admins/${id}/status`, { status });
      fetchComplaints();
    } catch (error) {
      console.error("Error updating status", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <main className="admin-page">
        <section className="admin-shell">
          <h2>Admin Dashboard</h2>

          {errorMessage && <p className="admin-empty">{errorMessage}</p>}
          {!errorMessage && isLoading && <p className="admin-empty">Loading complaints...</p>}
          {!errorMessage && !isLoading && complaints.length === 0 && (
            <p className="admin-empty">No complaints available right now.</p>
          )}

          {!errorMessage && !isLoading && complaints.length > 0 && (
            <div className="admin-list">
              {complaints
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((c) => (
                  <article
                    key={c.complaintId}
                    className={`admin-item ${updatingId === c.complaintId ? "admin-item--updating" : ""}`}
                  >
                    {/* ── Header: ID + category + status ── */}
                    <div className="admin-item-header">
                      <div className="admin-item-meta">
                        <span className="admin-complaint-id">#{c.complaintId}</span>
                        {c.category && <span className="admin-category-tag">{c.category}</span>}
                        <StatusDropdown
                          complaintId={c.complaintId}
                          currentStatus={c.status || "SUBMITTED"}
                          onUpdate={updateStatus}
                        />
                      </div>
                    </div>

                    {/* ── Body: left content + right image ── */}
                    <div className="admin-item-body">
                      <div className="admin-item-left">
                        <p className="admin-description">{c.description}</p>

                        <div className="admin-item-details">
                          <div><strong>By:</strong> {c.name || "Unknown"}</div>
                          <div><strong>Department:</strong> {c.admin || "Not assigned"}</div>
                          {c.lat && <div><strong>Lat:</strong> {c.lat}</div>}
                          {c.lon && <div><strong>Lon:</strong> {c.lon}</div>}
                          {(c.lat || c.lon) && (
                            <div>
                              <a
                                className="admin-maps-link"
                                href={`https://www.google.com/maps?q=${c.lat},${c.lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                📍 View on Google Maps
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {c.imgSrc && (
                        <div className="admin-item-right">
                          <img
                            className="admin-image"
                            src={resolveComplaintImageUrl(c.imgSrc)}
                            alt="Complaint evidence"
                          />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
