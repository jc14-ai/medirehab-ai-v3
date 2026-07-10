from fastapi import APIRouter
from app.api.utils.build_model import build_model
import torch
import os

router = APIRouter(
    prefix="/evaluate",
    tags=["evaluate"]
)

@router.get("/{exercise_id}")
def model(exercise_id: str):
    global model_checkpoint
    global model
    model = build_model()
    
    if exercise_id == "SHOULDER_EXERCISE_1_ID" and os.path.exists("app/models/model.pth"):
        model_checkpoint = torch.load("app/models/model.pth", map_location="cpu")
        model.load_state_dict(model_checkpoint["model"])
        
    elif exercise_id == "SHOULDER_EXERCISE_2_ID":
        model_checkpoint = torch.load("app/models/model.pth", map_location="cpu")
        model.load_state_dict(model_checkpoint["model"])
        
    
        
    return {
        "evaluation_score": "model selected."
    }