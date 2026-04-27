# CivicVoice AI API

This repository contains a FastAPI service for civic complaint analysis.

The AI flow combines:
- Text analysis via Ollama (`llama3.2`)
- Image classification via CLIP (`ViT-B/32`)
- A fusion engine that computes category, urgency, priority score, and routing department

## Project Structure

- `ai/api.py` - FastAPI app
- `ai/models/text_analyzer.py` - Ollama text analysis
- `ai/models/image_classifier.py` - CLIP image classifier
- `ai/models/fusion_engine.py` - text + image fusion logic

## Prerequisites

- macOS/Linux terminal
- Python 3.10+ (project currently uses a local `.venv`)
- Ollama installed locally

Install Ollama:

```bash
brew install ollama
```

## 1) Python Environment Setup

From repository root:

```bash
cd /Users/nikhiltripathi/projects/civicvoice

# If .venv already exists, just activate it
source .venv/bin/activate

# If needed, create it first
# python3 -m venv .venv
# source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install uvicorn fastapi pillow python-multipart ollama torch numpy "git+https://github.com/openai/CLIP.git"
```

## 2) Run the Local LLM Model (Ollama)

Start Ollama server in a separate terminal:

```bash
ollama serve
```

Pull the required model (one-time):

```bash
ollama pull llama3.2
```

Quick test:

```bash
ollama run llama3.2 "Say hello"
```

## 3) Run the FastAPI Server

Use one of these commands:

From repo root:

```bash
cd /Users/nikhiltripathi/projects/civicvoice
source .venv/bin/activate
uvicorn --app-dir ai api:app --reload
```

From `ai` directory:

```bash
cd /Users/nikhiltripathi/projects/civicvoice/ai
source ../.venv/bin/activate
uvicorn api:app --reload
```

Server URL:

- API: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs

## 4) Test the API

Text-only request:

```bash
curl -X POST "http://127.0.0.1:8000/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "text=There is a huge pothole near MG Road"
```

Text + image request:

```bash
curl -X POST "http://127.0.0.1:8000/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "text=Streetlight is broken at the main junction" \
  -F "image=@ai/sample.jpg"
```

## Troubleshooting

### `uvicorn: command not found`

```bash
source .venv/bin/activate
python -m uvicorn --app-dir ai api:app --reload
```

### `Error loading ASGI app. Could not import module "api"`

You started from repo root without `--app-dir ai`.

Use:

```bash
uvicorn --app-dir ai api:app --reload
```

### `Address already in use`

Port 8000 is busy.

```bash
lsof -nP -iTCP:8000 -sTCP:LISTEN
kill -9 <PID>
# or run on another port
uvicorn --app-dir ai api:app --reload --port 8001
```

## Notes

- Keep using `.venv` as the primary environment for this repository.
- The first CLIP model load may download artifacts and can take extra time.
- Keep `ollama serve` running while using text analysis endpoints.
