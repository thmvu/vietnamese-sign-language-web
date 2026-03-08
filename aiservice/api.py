from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from inference import SignLanguageInference, SEQUENCE_LENGTH, FEATURES_PER_FRAME
import uvicorn



app = FastAPI(
    title="Vietnamese Sign Language AI Service",
    description="AI inference service for sign language recognition",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

inference_engine = SignLanguageInference(
    model_path='model/final_model.keras',
    dictionary_path='model/gesture_dictionary.npz'
)


# ------------------------------------------------------------------
# Request / Response schemas
# ------------------------------------------------------------------

class SequenceInput(BaseModel):
    """
    A sliding-window sequence of SEQUENCE_LENGTH frames for LSTM prediction.
    Each frame is a FLAT float array of 42 features:
      [x0, y0, x1, y1, ..., x20, y20]  — 21 landmarks of the primary hand.

    frames: List[List[float]]   shape: (100, 42)
    """
    frames: List[List[float]]


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Vietnamese Sign Language AI Service",
        "status": "running",
        "version": "2.0.0",
        "model_loaded": inference_engine.model is not None,
        "endpoints": {
            "predict_sequence": "/predict",
            "health": "/health"
        }
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": inference_engine.model is not None,
        "sequence_length": SEQUENCE_LENGTH,
        "features_per_frame": FEATURES_PER_FRAME,
    }


@app.post("/predict")
async def predict(data: SequenceInput):
    """
    Predict the sign language gesture from a sequence of frames.

    Expects `frames`: list of SEQUENCE_LENGTH frames.
    Each frame is a FLAT list of 42 floats: [x0,y0,...,x20,y20]
    representing 21 landmarks of the primary detected hand.
    """
    try:
        if not data.frames:
            raise HTTPException(status_code=400, detail="frames array is empty")

        if len(data.frames) != SEQUENCE_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Expected {SEQUENCE_LENGTH} frames, got {len(data.frames)}"
            )

        for frame_idx, frame in enumerate(data.frames):
            if len(frame) != FEATURES_PER_FRAME:
                raise HTTPException(
                    status_code=400,
                    detail=f"Frame {frame_idx}: expected {FEATURES_PER_FRAME} features, got {len(frame)}"
                )

        # Convert to numpy array: shape (100, 42)
        sequence = np.array(data.frames, dtype=np.float32)

        predicted_sign, confidence = inference_engine.predict_from_sequence(sequence)

        return {
            "predicted_sign": predicted_sign,
            "confidence": float(confidence),
            "status": "success"
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)