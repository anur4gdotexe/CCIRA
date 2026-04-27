import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

const BACKEND_ORIGIN = (import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:5001").replace(/\/$/, "");

const resolveComplaintImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") {
    return "";
  }

  // Cloudinary and other absolute URLs should be used as-is.
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND_ORIGIN}/${normalizedPath}`;
};

export default function AdminDashboard() {

  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

    try {

      await API.patch(`/complaints/admins/${id}/status`, {
        status
      });

      fetchComplaints();

    } catch (error) {
      console.error("Error updating status", error);
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
                <article key={c.complaintId} className="admin-item">
                  <p><strong>Description:</strong> {c.description}</p>
                  <p><strong>Status:</strong> {c.status}</p>
                  <p><strong>Submitted by:</strong> {c.user?.name || c.user?.email || "Unknown user"}</p>
                  <p><strong>Department:</strong> {c.admin || "Not assigned"}</p>

                  {c.image && (
                    <img
                      className="admin-image"
                      src={resolveComplaintImageUrl(c.image)}
                      alt="Complaint evidence"
                    />
                  )}

                  <div className="admin-actions">
                    {/* <button onClick={() => updateStatus(c.complaintId, "in-progress")}>Start</button> */}
                    {
                      c.status === "RESOLVED" ? 
                        <button disabled>Resolved</button> :
                        <button onClick={() => updateStatus(c.complaintId, "resolved")}>Resolve</button>
                    }
                    
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