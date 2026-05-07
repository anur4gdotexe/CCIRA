import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [adminInfo, setAdminInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Filters & sort
  const [filterStatus,   setFilterStatus]   = useState("ALL");
  const [filterUrgency,  setFilterUrgency]  = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [sortBy,         setSortBy]         = useState("newest");

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [complaintsRes, adminRes] = await Promise.all([
        API.get("/complaints/admins"),
        API.get("/admins/me"),
      ]);
      setComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : []);
      setAdminInfo(adminRes.data);
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

  const displayedComplaints = useMemo(() => {
    let result = [...complaints];

    if (filterStatus   !== "ALL") result = result.filter(c => c.status   === filterStatus);
    if (filterUrgency  !== "ALL") result = result.filter(c => c.urgency  === filterUrgency);
    if (filterCategory !== "ALL") result = result.filter(c => c.category === filterCategory);

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "urgency") {
        const order = { High: 0, Medium: 1, Low: 2 };
        return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3);
      }
      return 0;
    });

    return result;
  }, [complaints, filterStatus, filterUrgency, filterCategory, sortBy]);

  return (
    <>
      <Navbar />

      <main className="admin-page">

        {/* ── Header card with toolbar ── */}
        <section className="admin-header-card">
          <p className="admin-header-label">Admin Dashboard</p>
          {adminInfo && (
            <>
              <h2 className="admin-header-name">{adminInfo.adminName}</h2>
              {(adminInfo.district || adminInfo.state) && (
                <p className="admin-header-jurisdiction">
                  {[adminInfo.district, adminInfo.state].filter(Boolean).join(", ")}
                </p>
              )}
            </>
          )}

          <div className="admin-toolbar">
            <div className="admin-select-wrap">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="DECLINED">Declined</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="admin-select-wrap">
              <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
                <option value="ALL">All Urgencies</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="admin-select-wrap">
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="ALL">All Categories</option>
                <option value="ROAD">Road</option>
                <option value="WATER">Water</option>
                <option value="WASTE">Waste</option>
                <option value="SEWAGE">Sewage</option>
              </select>
            </div>

            <div className="admin-select-wrap">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="urgency">Urgency: High → Low</option>
              </select>
            </div>

            <button type="button" onClick={fetchComplaints} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        <section className="admin-shell">
          {errorMessage && <p className="admin-empty">{errorMessage}</p>}
          {!errorMessage && isLoading && <p className="admin-empty">Loading complaints...</p>}
          {!errorMessage && !isLoading && complaints.length === 0 && (
            <p className="admin-empty">No complaints available right now.</p>
          )}
          {!errorMessage && !isLoading && complaints.length > 0 && displayedComplaints.length === 0 && (
            <p className="admin-empty">No complaints match the selected filters.</p>
          )}

          {!errorMessage && !isLoading && displayedComplaints.length > 0 && (
            <div className="admin-list">
              {displayedComplaints.map((c) => (
                  <article
                    key={c.complaintId}
                    className={`admin-item ${updatingId === c.complaintId ? "admin-item--updating" : ""}`}
                  >
                    {/* ── Header: ID + category + urgency + status ── */}
                    <div className="admin-item-header">
                      <div className="admin-item-meta">
                        <span className="admin-complaint-id">#{c.complaintId}</span>
                        {c.category && <span className="admin-category-tag">{c.category}</span>}
                        {c.urgency && (
                          <span className={`admin-urgency-tag admin-urgency-${c.urgency.toLowerCase()}`}>
                            {c.urgency}
                          </span>
                        )}
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
