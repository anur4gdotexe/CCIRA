from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import time
import os
import tempfile

from models.fusion_engine import fuse_results

app = FastAPI(
    title="CCIRA AI Engine",
    version="1.1",
    description="AI-powered civic complaint analysis system"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Health Check
# -----------------------------
@app.get("/")
def root():
    return {
        "message": "CCIRA AI Running",
        "status": "healthy"
    }


# -----------------------------
# Analyze Complaint
# -----------------------------
@app.post("/analyze")
async def analyze_complaint(
    text: str = Form(...),
    image: UploadFile = File(None)
):

    start_time = time.time()
    tmp_image_path = None

    try:
        if image:
            contents = await image.read()

            try:
                Image.open(io.BytesIO(contents)).verify()
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid image file uploaded"
                )

            _, ext = os.path.splitext(image.filename or "")
            ext = ext if ext else ".jpg"

            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(contents)
                tmp_image_path = tmp.name

        result = fuse_results(text, tmp_image_path)

        processing_time = round(time.time() - start_time, 3)

        return {
            "analysis": result,
            "meta": {
                "processing_time_seconds": processing_time,
                "image_provided": image is not None
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI processing failed: {str(e)}"
        )
    finally:
        if tmp_image_path:
            try:
                os.unlink(tmp_image_path)
            except Exception:
                pass
