import "./ComplaintCard.css";

const BACKEND_ORIGIN = (import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:5001").replace(/\/$/, "");

// Order matters — this defines the tracker step sequence
const STATUS_STEPS = ["SUBMITTED", "ACCEPTED", "RESOLVED"];

const statusClassMap = {
  SUBMITTED: "status-submitted",
  ACCEPTED:  "status-accepted",
  DECLINED:  "status-declined",
  RESOLVED:  "status-resolved",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const resolveComplaintImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND_ORIGIN}/${normalizedPath}`;
};

function StatusTracker({ status, statusHistory }) {
  const isDeclined = status === "DECLINED";

  // Build a map of status → timestamp from history
  const historyMap = {};
  if (Array.isArray(statusHistory)) {
    statusHistory.forEach((e) => {
      if (e?.status) historyMap[e.status] = e.timestamp;
    });
  }

  if (isDeclined) {
    return (
      <div className="status-tracker status-tracker--declined">
        <div className="tracker-declined-row">
          <span className="tracker-declined-dot" />
          <div>
            <span className="tracker-declined-label">Complaint Declined</span>
            {historyMap["DECLINED"] && (
              <span className="tracker-step-time">{formatDate(historyMap["DECLINED"])}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="status-tracker">
      {/* Rail: dot, connector, dot, connector, dot — matches grid-template-columns */}
      <div className="tracker-rail">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = Array.isArray(statusHistory) && statusHistory.some((e) => e.status === step);
          const isActive = status === step;
          const isLast = index === STATUS_STEPS.length - 1;

          return (
            <>
              <div
                key={step}
                className={`tracker-dot ${isCompleted ? "tracker-dot--done" : ""} ${isActive ? "tracker-dot--active" : ""}`}
              >
                {isCompleted && (
                  <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {!isLast && (
                <div className={`tracker-connector ${isCompleted ? "tracker-connector--done" : ""}`} />
              )}
            </>
          );
        })}
      </div>

      {/* Labels: same grid, nth-child CSS places them under the correct dot column */}
      <div className="tracker-labels">
        {STATUS_STEPS.map((step) => {
          const isCompleted = Array.isArray(statusHistory) && statusHistory.some((e) => e.status === step);
          const isActive = status === step;
          const timestamp = historyMap[step];

          return (
            <div key={step} className={`tracker-label-item ${isCompleted || isActive ? "tracker-label-item--active" : ""}`}>
              <span className="tracker-step-label">{step}</span>
              {timestamp && (
                <span className="tracker-step-time">{formatDate(timestamp)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ComplaintCard({ complaint }) {
  if (!complaint) return null;

  const status = complaint.status || "SUBMITTED";
  const statusClass = statusClassMap[status] || "status-submitted";

  return (
    <article className="complaint-card">
      <div className="complaint-card-header">
        <h3>Complaint #{complaint.complaintId || "N/A"}</h3>
        <span className={`status-chip ${statusClass}`}>{status}</span>
      </div>

      <p className="complaint-description">{complaint.description || "No description provided"}</p>

      {complaint.imgSrc && (
        <img
          className="complaint-image"
          src={resolveComplaintImageUrl(complaint.imgSrc)}
          alt="Uploaded complaint evidence"
        />
      )}

      <div className="complaint-grid">
        <div>
          <label>Category</label>
          <p>{complaint.category || "Uncategorized"}</p>
        </div>
        <div>
          <label>Department</label>
          <p>{complaint.admin || "Not assigned"}</p>
        </div>
        <div>
          <label>Latitude</label>
          <p>{complaint.lat || "-"}</p>
        </div>
        <div>
          <label>Longitude</label>
          <p>{complaint.lon || "-"}</p>
        </div>
        <div>
          <label>Created At</label>
          <p>{formatDate(complaint.createdAt)}</p>
        </div>
        <div>
          <label>Updated At</label>
          <p>{formatDate(complaint.updatedAt) || "-"}</p>
        </div>
      </div>

      <StatusTracker status={status} statusHistory={complaint.statusHistory} />
    </article>
  );
}
