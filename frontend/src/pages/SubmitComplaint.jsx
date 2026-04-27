import { useState } from "react";
import API from "../services/api";
import LocationMap from "../components/LocationMap";
import Navbar from "../components/Navbar";
import "./SubmitComplaint.css";
import potholeImage from "../assets/pothole.jpg";
import garbageImage from "../assets/garbage.jpg";
import waterImage from "../assets/water.jpg";
import roadImage from "../assets/road.jpg";
import { getLocation, uploadImageToCloudinary } from "../utils/functions";

export default function SubmitComplaint() {

  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const setError = (message) => {
    setFormSuccess("");
    setFormError(message);
  };

  const handleDetectLocation = () => {

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setFormError("");
        setIsDetectingLocation(false);
      },
      () => {
        setError("Unable to detect your location. You can click on the map to select it manually.");
        setIsDetectingLocation(false);
      }
    );

  };

  const submitComplaint = async (e) => {

    e.preventDefault();

    if (!description.trim()) {
      setError("Please add a description.");
      return;
    }

    if (!location) {
      setError("Please select a location on the map.");
      return;
    }

    const getLRes = await getLocation(location.lat, location.lon)
    console.log(getLRes)

    const state = getLRes['state']
    const district = getLRes['district']

    // const [state, district] = await getLocation(location.lat, location.lon)

    if (phone && !/^\+?[0-9\s()-]{7,20}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    let category = "OTHER";

    try {
      const formData = new FormData();
      formData.append("text", description);
      if (image) formData.append("image", image);

      const aiRes = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const aiData = await aiRes.json();
      category = aiData?.analysis?.category || "OTHER";

    } catch (err) {
      console.error("AI error:", err);
    }

    setFormError("");
    setFormSuccess("");
    setIsSubmitting(true);

    const payload = {
      description: description.trim(),
      lat: location.lat,
      lon: location.lon,
      state: state,
      district: district,
      image: image ? await uploadImageToCloudinary(image) : null,
      name,
      phone,
      category: category
    };

    try {

      console.log("YAHA TAK POHCHE KYA?")
      const response = await API.post("/complaints/users", payload);
      console.log("YAHA TAK POHCHE KYA?")

      setFormSuccess(response?.data?.message || "Complaint submitted successfully.");

      setDescription("");
      setImage(null);
      setLocation(null);
      setName("");
      setPhone("");

    } catch (error) {

      setError(error.userMessage || "Unable to submit complaint. Please try again.");

    } finally {
      setIsSubmitting(false);
    }

  };

  return (

    <>
      <Navbar />

      <div className="submit-page">

        <form className="submit-card" onSubmit={submitComplaint}>

          <h2 className="submit-title">
            Report a Civic Issue Today – Build a Better City Tomorrow
          </h2>
          <p className="submit-intro">
            Share accurate details and location so the right department can resolve your issue faster.
          </p>

          {formError && <p className="submit-alert submit-alert-error">{formError}</p>}
          {formSuccess && <p className="submit-alert submit-alert-success">{formSuccess}</p>}

          <div className="submit-grid">

            {/* LEFT COLUMN */}
            <div className="left-form">
              <div className="form-block-title">Contact Details</div>

              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />

              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
              />

              <p className="form-help-text">
                We use your contact details only to share complaint updates.
              </p>
            </div>

            {/* RIGHT COLUMN */}
            <div className="right-form">
              <div className="form-block-title">Issue Details</div>

              <label>Description</label>
              <textarea
                rows="8"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue clearly: landmark, severity, and urgency"
              ></textarea>

              <label>Upload photo</label>
              <label className="upload-box">
                <span>{image ? image.name : "Tap to Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>

              <label>Example Images</label>
              <div className="example-images">
                <img src={potholeImage} alt="Pothole example" />
                <img src={garbageImage} alt="Garbage issue example" />
                <img src={waterImage} alt="Water issue example" />
                <img src={roadImage} alt="Road issue example" />
              </div>

              <label>Your Location</label>
              <button
                type="button"
                className="detect-btn"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
              >
                {isDetectingLocation ? "Detecting..." : "Detect My Location"}
              </button>

              <div className="map-box">
                <LocationMap setLocation={setLocation} />
              </div>

              <div className="coords-grid">
                <div>
                  <label>Latitude</label>
                  <input type="text" value={location?.lat || ""} readOnly />
                </div>
                <div>
                  <label>Longitude</label>
                  <input type="text" value={location?.lon || ""} readOnly />
                </div>
              </div>

            </div>

          </div>

          {/* <p className="submit-note">Be the change. Report issues now!</p> */}

          <button className="submit-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>

        </form>

      </div>

    </>
  );
}