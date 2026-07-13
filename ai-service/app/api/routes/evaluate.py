from fastapi import APIRouter
import torch
import os

from app.utils.build_model import build_model
from app.utils.preprocess import preprocess
from app.utils.evaluate import get_reconstruction_error, compute_similarity_score

router = APIRouter(
    prefix="/evaluate",
    tags=["evaluate"]
)

"""
model object structure:
    "model": model.state_dict(),
    "best_val_loss": best_val_loss,
    "mean_val_loss": mean_val_loss,
    "std_val_loss": std_val_loss,
    "beta": beta
"""

@router.get("/{user_id}/{exercise_id}")
def evaluate(user_id: str, exercise_id: str):
    output_folder = f"data/trace/user_{user_id}/exercise_{exercise_id}"
    data, input_dim = preprocess(output_folder)
    
    model_checkpoint = None
    model = None
    
    mean_val_loss = 0.0
    beta = 1.0

    model = build_model(input_dim)
    
    if exercise_id == "1" and os.path.exists("app/models/model.pth"):
        model_checkpoint = torch.load("app/models/model.pth", map_location="cpu")
        model.load_state_dict(model_checkpoint["model"])
        mean_val_loss = model_checkpoint.get("mean_val_loss", 0.0)
        beta = model_checkpoint.get("beta", 1.0)
        
    # elif exercise_id == "1" and os.path.exists("app/models/model.pth"):
    #     model_checkpoint = torch.load("app/models/model.pth", map_location="cpu")
    #     model.load_state_dict(model_checkpoint["model"])
    #     mean_val_loss = model_checkpoint.get("mean_val_loss", 0.0)
    #     beta = model_checkpoint.get("beta", 1.0)
        
    error = get_reconstruction_error(model, data)
    score = compute_similarity_score(error, mean_val_loss, beta)
        
    return {
        "success": True,
        "message": "Evaluation completed successfully.",
        "error": error,
        "score": score
    }