# Backend <-> AI Integration Guide

This document explains how the Node backend is connected to your FastAPI AI engine, how requests flow, and how to run the full stack.

## What is integrated

The backend complaint pipeline now calls your AI model service at:

- `POST {AI_API_URL}/analyze`

The backend sends:

- `text` (complaint description)
- `image` (optional uploaded file)

The AI service responds with `analysis` (category, department, urgency, score, etc.).
The backend stores `category` and `department` into MongoDB complaint records.

If AI is unavailable or returns invalid data, backend uses a local fallback classifier so complaint submission still works.

## Files changed for integration

- `backend/modules/ai/ai.service.js`
  - Replaced keyword-only classifier with external AI API client
  - Adds request timeout and safe fallback
  - Supports optional image upload to AI service

- `backend/modules/complaint/complaint.controller.js`
  - Updated complaint creation to `await` the async AI classifier
  - Sends `description` + uploaded image path to AI service

## Runtime flow

1. Frontend submits complaint to backend endpoint:
   - `POST /api/complaints` with form-data (`description`, optional `image`, `lat`, `lng`)
2. Backend uploads image to local `uploads/` via multer.
3. Backend calls AI client (`classifyComplaint`) in `ai.service.js`.
4. AI client sends multipart request to Python AI API `/analyze`.
5. FastAPI runs fusion engine and returns analysis.
6. Backend stores complaint with AI-driven `category` and `department`.
7. Backend responds with saved complaint.

## Required environment variables (backend)

In `backend/.env`:

- `AI_API_URL=http://127.0.0.1:8000`
- `AI_TIMEOUT_MS=12000` (optional, default is 12000)
- `CLOUDINARY_CLOUD_NAME=<your-cloud-name>`
- `CLOUDINARY_API_KEY=<your-api-key>`
- `CLOUDINARY_API_SECRET=<your-api-secret>`

Legacy names `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_API_SECRET` are also supported.

You already have `AI_API_URL` configured.

## Start order (important)

Use separate terminals.

1) Start Ollama (required for text analysis in AI service)

```bash
ollama serve
```

2) Start AI FastAPI server

```bash
cd /Users/nikhiltripathi/projects/civicvoice
source .venv/bin/activate
uvicorn --app-dir ai api:app --reload --port 8000
```

3) Start backend

```bash
cd /Users/nikhiltripathi/projects/civicvoice/backend
npm install
npm run dev
```

4) Start frontend

```bash
cd /Users/nikhiltripathi/projects/civicvoice/frontend
npm install
npm run dev
```

## Verify integration quickly

### A) AI health

```bash
curl http://127.0.0.1:8000/
```

Expected contains `CivicVoice AI Running`.

### B) AI analysis directly

```bash
curl -X POST "http://127.0.0.1:8000/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "text=There is a large pothole near MG Road"
```

### C) Backend complaint creation

Create complaint from frontend or call backend route with auth token and form-data.
If successful, DB complaint should include AI-derived `category` and `department`.

## Failure behavior

If AI service is down, backend logs:

- `AI integration failed, using fallback classifier: ...`

And still creates complaint with fallback values.

## Common issues

### Backend starts but AI classification not happening

- Ensure AI server is running on `AI_API_URL`.
- Confirm `backend/.env` has the correct URL.
- Restart backend after changing `.env`.

### AI endpoint is slow or times out

- Increase `AI_TIMEOUT_MS` in backend `.env`.
- Check first-time model loading delays (CLIP/Ollama).

### Image-related AI issues

- Ensure uploaded image is valid.
- Check FastAPI logs for `/analyze` errors.

## Notes on current DB schema

Current complaint schema stores these AI fields:

- `category`
- `department`

AI also returns additional values (`urgency`, `priority_score`, `confidence`, `keywords`), which are available in backend service and can be persisted later if you extend `complaint.model.js`.
