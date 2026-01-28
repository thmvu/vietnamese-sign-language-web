from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from inference import SignLanguageInference
import uvicorn

app = FastAPI(
    title="Vietnamese Sign Language AI Service",
    description="AI inference service for sign language recognition",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

inference_engine = SignLanguageInference(
    model_path='model/gesture_embedding_model.keras',
    dictionary_path='model/gesture_dictionary.npz'
)

class LandmarksInput(BaseModel):
    landmarks: List[List[float]]

@app.get("/")
def root():
    return {
        "message": "Vietnamese Sign Language AI Service",
        "status": "running",
        "endpoints": {
            "predict": "/predict",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": inference_engine.model is not None
    }

@app.post("/predict")
async def predict(data: LandmarksInput):
    try:
        if not data.landmarks:
            raise HTTPException(status_code=400, detail="Landmarks array is empty")
        
        landmarks_array = np.array(data.landmarks)
        
        if landmarks_array.shape[0] != 21 or landmarks_array.shape[1] != 3:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid landmarks shape. Expected (21, 3), got {landmarks_array.shape}"
            )
        
        predicted_sign, confidence = inference_engine.predict(landmarks_array)
        
        return {
            "predicted_sign": predicted_sign,
            "confidence": float(confidence),
            "status": "success"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)