import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import ComplaintCard from "../components/ComplaintCard";
import "./TrackComplaint.css";

export default function TrackComplaint() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadComplaints = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await API.get("/complaints/users");
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("Please login first to track your complaints.");
        return;
      }

      setErrorMessage(error.userMessage || "Unable to load complaints.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    const needle = searchId.trim().toUpperCase();

    if (!needle) return complaints

    return complaints.filter((complaint) => {
      const id = complaint?.complaintId || ""
      return id.includes(needle);
    });
  }, [complaints, searchId]);

  return (
    <>
      <Navbar />

      <main className="track-page">
        <section className="track-header-card">
          <h1>Track Your Complaints</h1>
          <p>Use complaint ID search and follow the latest status updates in one place.</p>

          <div className="track-toolbar">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search by complaint ID"
              aria-label="Search complaint by id"
            />
            <button type="button" onClick={loadComplaints} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        {errorMessage && (
          <section className="track-message track-error">
            <p>{errorMessage}</p>
            {errorMessage.includes("login") && (
              <button type="button" onClick={() => navigate("/login")}>Go to Login</button>
            )}
          </section>
        )}

        {!errorMessage && isLoading && (
          <section className="track-message">
            <p>Loading your complaints...</p>
          </section>
        )}

        {!errorMessage && !isLoading && complaints.length === 0 && (
          <section className="track-message">
            <p>No complaints found yet. Submit your first complaint to start tracking.</p>
            <button type="button" onClick={() => navigate("/submit")}>Submit Complaint</button>
          </section>
        )}

        {!errorMessage && !isLoading && complaints.length > 0 && filteredComplaints.length === 0 && (
          <section className="track-message">
            <p>No complaints matched this ID.</p>
          </section>
        )}

        {!errorMessage && !isLoading && filteredComplaints.length > 0 && (
          <section className="track-list">
            {filteredComplaints
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((complaint) => (
                <ComplaintCard key={complaint.complaintId} complaint={complaint} />
              ))}
          </section>
        )}
      </main>
    </>
  );
}