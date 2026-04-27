import "./ComplaintCard.css";

const BACKEND_ORIGIN = (import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:5001").replace(/\/$/, "");

const statusClassMap = {
 PENDING: "status-pending",
 ASSIGNED: "status-assigned",
 "in-progress": "status-in-progress",
 RESOLVED: "status-resolved"
};

const formatDate = (value) => {
 if (!value) {
  return "-";
 }

 const date = new Date(value);

 if (Number.isNaN(date.getTime())) {
  return "-";
 }

 return date.toLocaleString();
};

const resolveComplaintImageUrl = (imagePath) => {
 if (!imagePath || typeof imagePath !== "string") {
  return "";
 }

 if (/^https?:\/\//i.test(imagePath)) {
  return imagePath;
 }

 const normalizedPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
 return `${BACKEND_ORIGIN}/${normalizedPath}`;
};

export default function ComplaintCard({ complaint }) {
 if (!complaint) {
  return null;
 }

 const status = complaint.status || "PENDING";
 const statusClass = statusClassMap[status] || "status-pending";

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
     <p>{formatDate(complaint.updatedAt) || ""}</p>
    </div>
   </div>
  </article>
 );
}
