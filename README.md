# CCIRA — Crowdsourced Civic Issues Reporting App
### Complete Project Guide for the Team

---

## What Is This?

CCIRA (Crowdsourced Civic Issues Reporting App) is a full-stack web platform that lets citizens report civic problems — potholes, garbage, water leaks, broken streetlights — and lets municipal admin bodies track and resolve them. The twist: it uses AI to automatically classify complaints by category and urgency, and it uses geospatial logic to route each complaint to the right government department based on where the issue is located.

Think of it as a smarter, more transparent version of a civic grievance portal.

---

## The Big Picture — How It All Fits Together

The project has **three separate services** that work together:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              React + Vite  (port 5173)                      │
│   Home → Login → Submit Complaint → Track → Admin Dashboard │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API calls
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
┌─────────────────┐   ┌──────────────────────┐
│  SPRING BOOT    │   │    AI ENGINE          │
│  Java Backend   │   │    Python / FastAPI   │
│  (port 8081)    │   │    (port 8000)        │
│                 │   │                       │
│  - Auth (JWT)   │   │  - Text analysis      │
│  - Complaints   │   │    (Ollama / llama3.2)│
│  - Geo-routing  │   │  - Image classification│
│  - Admin mgmt   │   │    (CLIP ViT-B/32)    │
└────────┬────────┘   └──────────────────────┘
         │
         ▼
┌─────────────────┐
│    MongoDB      │
│  (port 27017)   │
│  db: ccira      │
└─────────────────┘
```

The frontend talks to the Spring Boot backend for all data operations. When a user submits a complaint, the frontend *also* calls the AI engine to classify it before sending the final payload to the backend.

Images are uploaded to **Cloudinary** (a cloud image hosting service) — the backend only stores the image URL, not the file itself.

Location reverse-geocoding (turning GPS coordinates into state/district names) is done via the **OpenStreetMap Nominatim API** — no API key needed.

---

## Tech Stack at a Glance

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Spring Boot 4, Spring Security, Spring Data MongoDB |
| Database | MongoDB (local, port 27017) |
| AI Engine | Python, FastAPI, Ollama (llama3.2), OpenAI CLIP |
| Auth | JWT (HS256, 7-day expiry) |
| Image Storage | Cloudinary |
| Maps / Geocoding | OpenStreetMap Nominatim, Leaflet (LocationMap component) |
| Geospatial Logic | JTS (Java Topology Suite) + GeoJSON polygons |

---

## Part 1 — The Frontend

**Location:** `frontend/`

Built with React + Vite. The app has a clean, glassmorphism-style UI with parallax tilt cards on the home page.

### Pages

**`/` — Home**
The landing page. Shows the CCIRA tagline, impact metrics (24hr response time, live status, city-wide coverage), and two tilt cards — one for citizens, one for municipal admins. Clicking either card routes to the login page with the appropriate role pre-selected via query param (`?role=user` or `?role=admin`).

![Home page hero section](impl_screenshots/Screenshot%202026-04-27%20145009.png)
![Home page portal cards and footer](impl_screenshots/Screenshot%202026-04-27%20145027.png)

**`/login` — Login**
Split-panel design. Left side has branding and an illustration. Right side has the login form. Accepts a User ID and password. On success, the JWT token is decoded client-side to extract the user's role and ID, then stored in localStorage. Redirects to `/submit` for users or `/admin` for admins.

![Login page](impl_screenshots/Screenshot%202026-04-27%20145158.png)

**`/register` — Register**
Same split-panel layout. Accepts name, email, and password. Role is passed via query param. Calls `POST /auth/register`.

**`/submit` — Submit Complaint**
The most complex page. Two-column form:
- Left: contact details (name, phone)
- Right: issue description, image upload, example images (pothole, garbage, water, road), location detection

When submitted:
1. GPS coordinates are reverse-geocoded to get state + district via Nominatim
2. The description + image are sent to the AI engine (`http://localhost:8000/analyze`) to get a category
3. The image is uploaded to Cloudinary to get a URL
4. Everything is packaged and sent to the Spring Boot backend

![Submit complaint form](impl_screenshots/Screenshot%202026-04-27%20145450.png)
![Submit complaint map and location](impl_screenshots/Screenshot%202026-04-27%20145525.png)

**`/track` — Track Complaint**
Shows all complaints submitted by the logged-in user. Has a search bar to filter by complaint ID. Each complaint renders as a `ComplaintCard` with a visual status tracker (Submitted → Accepted → Resolved, or a "Declined" state).

![Track complaints list](impl_screenshots/Screenshot%202026-04-27%20145633.png)
![Track complaint resolved detail](impl_screenshots/Screenshot%202026-04-27%20145657.png)

**`/admin` — Admin Dashboard**
Shows all complaints routed to the logged-in admin body. Sorted newest-first. Each complaint shows the description, category, submitter name, assigned department, GPS coordinates with a Google Maps link, and the complaint image. Admins can update status via a dropdown: `SUBMITTED → ACCEPTED → RESOLVED` or `DECLINED`.

### Key Components

**`Navbar`** — Role-aware. Shows "Track Complaint" and "Submit Complaint" links for users, "Admin Dashboard" for admins. Shows Logout when authenticated.

**`ComplaintCard`** — Renders a single complaint with a visual step tracker. Handles the "DECLINED" edge case separately (shows a red declined state instead of the normal 3-step tracker).

**`LocationMap`** — An interactive Leaflet map where users can click to drop a pin and set their complaint location.

**`MiniMap`** — A smaller read-only map for displaying a complaint's location.

### Auth Context

`AuthContext.jsx` manages auth state globally. It:
- Reads the JWT from localStorage on load
- Decodes it client-side (no server call needed) to get user ID and role
- Checks expiry on every render
- Exposes `login()`, `logout()`, `isAuthenticated`, and `user` to all components

The `ProtectedRoute` and `AdminRoute` wrappers in `App.jsx` exist but are currently **commented out** — routes are accessible without auth for now (likely for demo/development purposes).

### API Service

`services/api.js` is an Axios instance pointed at `http://localhost:8081/resources`. It automatically:
- Attaches the JWT as a `Bearer` token on every request
- Clears auth storage on 401 responses
- Extracts a human-readable error message from any failed response

---

## Part 2 — The Spring Boot Backend

**Location:** `ccira_apis/`

A Spring Boot 4 REST API running on port 8081 with context path `/resources`. Uses MongoDB for persistence and JWT for stateless auth.

### Project Structure

```
com/ccira_apis/
├── complaints/       ← Core complaint logic
├── admin_bodies/     ← Municipal admin body management
├── users/            ← Citizen user management
├── maps/             ← Geospatial routing tables
└── CciraApisApplication.java

utils/
├── auth/             ← JWT filter, util, login DTO
└── config/           ← Security config, CORS config
```

### Data Models (MongoDB Collections)

**`complaints`**
The central document. Fields: `complaintId` (e.g. `C0042`), `description`, `category`, `imgSrc` (Cloudinary URL), `lat`, `lon`, `status`, `statusHistory` (array of `{status, timestamp}`), `name`, `phone`, `createdAt`, `updatedAt`, `admin`.

**`users`**
Fields: `userId`, `username`, `password`. Simple — no email stored at the DB level (registration may add more fields).

**`admin_bodies`**
Fields: `adminId`, `adminName`, `admin_password`, `email`, `websiteUrl`, `grievancePortal`. Represents a municipal department (e.g., Noida Authority Road Department).

**`location-admin_maps`**
The routing table. Maps a `(state, district)` pair to an `adminId`, with boolean flags: `handlesRoad`, `handlesSewage`, `handlesWaste`, `handlesWater`. This is how the system knows which department handles which type of complaint in which area.

**`complaint_user_maps`** and **`complaint_admin_maps`**
Junction tables linking complaints to users and admins respectively. This is a many-to-many design — a complaint can theoretically be routed to multiple admin bodies.

**`complaints_counter`**
A single document with a counter field. Used to generate sequential, human-readable complaint IDs like `C0001`, `C0042`, etc.

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login, returns JWT |
| POST | `/auth/register` | Public | Register new user/admin |
| POST | `/complaints/users` | USER role | Submit a new complaint |
| GET | `/complaints/users` | USER role | Get my complaints |
| GET | `/complaints/public` | Public | Get all complaints |
| GET | `/complaints/public/{id}` | Public | Get complaint by ID |
| GET | `/complaints/admins` | ADMIN role | Get complaints for my admin body |
| PATCH | `/complaints/admins/{id}/status` | ADMIN role | Update complaint status |

### How Complaint Routing Works (The Smart Part)

This is the most interesting piece of backend logic. When a complaint is submitted:

1. The frontend sends `lat`, `lon`, `state`, `district`, and `category`
2. `LocationAdminService.getAdminIds()` queries `location-admin_maps` to find all admin bodies in that state/district that handle the given category
3. For each candidate admin, it checks if the admin has a registered polygon (a GeoJSON file in `src/main/resources/polygons/`)
4. It uses **JTS (Java Topology Suite)** to do a point-in-polygon check — does the complaint's GPS coordinate fall inside the admin's service area?
5. Only admins whose polygon contains the complaint location are assigned

This means if you report a pothole in Noida, it goes to the Noida road authority — not the water authority, and not the Delhi road authority.

Currently, `noida.json` is the only polygon file present, so the system is configured for Noida.

### Security

Spring Security is configured with a JWT filter (`JwtFilter`) that runs before every request. The filter:
1. Extracts the `Authorization: Bearer <token>` header
2. Validates the token using `JwtUtil`
3. Sets the Spring Security context with the user's ID as principal and their roles

Route-level security:
- `/auth/**` and `/complaints/public/**` are open to everyone
- `/complaints/users/**` requires `ROLE_USER`
- `/complaints/admins/**` requires `ROLE_ADMIN`

Tokens are signed with HMAC-SHA256 and expire after 7 days.

### Complaint Status Flow

```
SUBMITTED → ACCEPTED → RESOLVED
         ↘ DECLINED
```

Valid statuses are enforced server-side. Each status change appends a timestamped event to `statusHistory`, giving a full audit trail.

---

## Part 3 — The AI Engine

**Location:** `ai/`

A FastAPI service running on port 8000. It analyzes complaint text and optionally an image to determine category and urgency.

### How It Works

**Step 1 — Text Analysis (`text_analyzer.py`)**

Sends the complaint description to a locally running **Ollama** instance (llama3.2 model) with a structured prompt. The LLM returns JSON with:
- `category`: Pothole, Garbage, Streetlight, Water Leak, Road Damage, or Other
- `keywords`: extracted keywords
- `urgency`: Low, Medium, or High

**Step 2 — Image Classification (`image_classifier.py`)**

If an image is provided, it's run through **OpenAI CLIP** (ViT-B/32 model). CLIP does zero-shot classification — it compares the image against a set of text labels using cosine similarity:
- "pothole on road"
- "garbage pile"
- "broken streetlight"
- "water leakage on road"
- "damaged road marking"

Returns the best-matching label and a confidence score.

**Step 3 — Fusion (`fusion_engine.py`)**

Combines text and image results:
- If image confidence > 0.65, the image classification overrides the text category
- Otherwise, text analysis wins
- Computes a `priority_score` (0–100) based on urgency level + confidence
- Normalizes the category to one of: `ROAD`, `WASTE`, `WATER`, `SEWAGE`, `OTHER`

**API Endpoint**

```
POST /analyze
Content-Type: multipart/form-data

Fields:
  text: string (required)
  image: file (optional)

Response:
{
  "analysis": {
    "category": "ROAD",
    "source": "image",
    "confidence": 0.82,
    "urgency": "High",
    "priority_score": 73,
    "keywords": ["pothole", "MG Road"]
  },
  "meta": {
    "processing_time_seconds": 1.234,
    "image_provided": true
  }
}
```

---

## How to Run the Project

You need three terminals running simultaneously.

### Prerequisites
- Java 17+
- MongoDB running locally on port 27017
- Python 3.10+
- Ollama installed (`brew install ollama` on Mac)
- Node.js 18+

### Terminal 1 — AI Engine

```bash
# Install Ollama model (one-time)
ollama pull llama3.2

# Start Ollama server
ollama serve

# In a new terminal, start the FastAPI server
cd ai
source ../venv/bin/activate   # or .venv depending on your setup
pip install uvicorn fastapi pillow python-multipart ollama torch numpy "git+https://github.com/openai/CLIP.git"
uvicorn api:app --reload
# Runs on http://localhost:8000
```

### Terminal 2 — Spring Boot Backend

```bash
cd ccira_apis
./gradlew bootRun
# Runs on http://localhost:8081/resources
```

Make sure MongoDB is running before this. On most systems: `mongod` or via MongoDB Compass.

### Terminal 3 — Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### MongoDB Setup

The database needs some seed data to work:
- At least one `admin_bodies` document
- A corresponding `location-admin_maps` entry linking that admin to a state/district with the right `handles_*` flags
- A polygon JSON file in `ccira_apis/src/main/resources/polygons/` matching the admin's service area
- A `complaints_counter` document: `{ _id: "complaints_counter", complaint_count: 0 }`

---

## User Flow — Step by Step

### For a Citizen

1. Visit the home page, click **User Portal**
2. Log in with your User ID and password
3. Click **Submit Complaint** in the navbar
4. Fill in your name, phone, and describe the issue
5. Optionally upload a photo
6. Click **Detect My Location** or click on the map to pin the location
7. Hit **Submit** — the AI classifies it, the image uploads to Cloudinary, and the complaint is routed to the right department
8. Go to **Track Complaint** to see your complaint's status and history

### For a Municipal Admin

1. Visit the home page, click **Admin Portal**
2. Log in with your Admin ID and password
3. The **Admin Dashboard** loads all complaints routed to your department
4. Each complaint shows the description, category, submitter info, GPS location (with Google Maps link), and photo
5. Use the status dropdown to **Accept**, **Decline**, or **Mark Resolved**
6. Status changes are timestamped and visible to the citizen in real time

---

## Key Design Decisions Worth Mentioning

**Why MongoDB?** Complaints have a variable structure (optional image, optional phone, growing status history). A document store fits this better than a rigid relational schema.

**Why JWT?** Stateless auth — the backend doesn't need to store sessions. The token carries the user's ID and role, so any service can validate it independently.

**Why Cloudinary?** Storing images in MongoDB or on the local filesystem doesn't scale. Cloudinary gives a CDN-backed URL that works anywhere.

**Why CLIP for image classification?** CLIP is a zero-shot model — you don't need to train it on civic complaint images. You just describe what you're looking for in plain English and it figures it out.

**Why JTS for geospatial routing?** It's the standard Java library for geometric operations. The point-in-polygon check is the cleanest way to handle irregular municipal boundaries.

**The complaint ID format (`C0001`)** is intentional — it's human-readable and easy to communicate over the phone, unlike a MongoDB ObjectId.

---

## Project Structure Summary

```
/
├── frontend/               React + Vite frontend
│   └── src/
│       ├── pages/          Home, Login, Register, SubmitComplaint,
│       │                   TrackComplaint, AdminDashboard, MyComplaint
│       ├── components/     Navbar, ComplaintCard, LocationMap, MiniMap
│       ├── context/        AuthContext (JWT state management)
│       ├── services/       api.js (Axios instance)
│       └── utils/          functions.js (geocoding, Cloudinary upload)
│
├── ccira_apis/             Spring Boot backend
│   └── src/main/java/
│       ├── com/ccira_apis/
│       │   ├── complaints/ Complaint model, controller, service, DTOs
│       │   ├── admin_bodies/ AdminBody model, controller, service
│       │   ├── users/      User model, controller, service
│       │   └── maps/       Location-admin routing, complaint-user/admin maps
│       └── utils/
│           ├── auth/       JWT filter, util, login DTO, auth controller
│           └── config/     Security config, CORS config
│
└── ai/                     Python AI engine
    ├── api.py              FastAPI app
    └── models/
        ├── text_analyzer.py    Ollama / llama3.2 text analysis
        ├── image_classifier.py CLIP image classification
        └── fusion_engine.py    Combines text + image results
```

---

*Built solo. Presented as a team. That's the real civic achievement here.*
