from fastapi import APIRouter, HTTPException
import torch

from app.model_registry import get_model_definition
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


@router.get("/{user_id}/{model_key}")
def evaluate(user_id: str, model_key: str):
    try:
        model_definition = get_model_definition(model_key)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    if not model_definition.checkpoint_path.exists():
        raise HTTPException(status_code=503, detail="Analysis model is unavailable.")

    output_folder = f"data/trace/user_{user_id}/exercise_{model_key}"
    data, input_dim = preprocess(
        output_folder,
        target_frames=model_definition.input_frames,
    )

    if input_dim != len(model_definition.features):
        raise HTTPException(
            status_code=422,
            detail="Exercise trace does not match the analysis model input.",
        )

    model = build_model(input_dim)
    model_checkpoint = torch.load(model_definition.checkpoint_path, map_location="cpu")
    model.load_state_dict(model_checkpoint["model"])
    mean_val_loss = model_checkpoint.get("mean_val_loss", 0.0)
    beta = model_checkpoint.get("beta", 1.0)

    error = get_reconstruction_error(model, data)
    score = compute_similarity_score(error, mean_val_loss, beta)

    return {
        "success": True,
        "message": "Evaluation completed successfully.",
        "error": error,
        "score": score
    }
