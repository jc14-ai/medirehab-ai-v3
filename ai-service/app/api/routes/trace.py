import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException
import os

from app.model_registry import get_model_definition
from app.utils.process_video import process_video_to_csv, get_next_sequence_path

router = APIRouter(
    prefix="/trace",
    tags=["trace"]
)


@router.post("/{user_id}/{model_key}")
async def trace(user_id: str, model_key: str, video: UploadFile = File(...)):
    try:
        get_model_definition(model_key)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    video_folder = f"data/videos/user_{user_id}/exercise_{model_key}"
    
    os.makedirs(video_folder, exist_ok=True)
    
    filename = f"{uuid.uuid4()}.webm"
    file_path = os.path.join(video_folder, filename)
    
    with open(file_path, "wb") as f:
        f.write(await video.read())
    
    output_folder = f"data/trace/user_{user_id}/exercise_{model_key}"
    
    os.makedirs(output_folder, exist_ok=True)
    
    if os.path.exists(video_folder):
        for filename in sorted(os.listdir(video_folder)):
            if filename.endswith((".mp4", ".avi", ".mov", ".mkv", ".webm")):
                video_path = os.path.join(video_folder, filename)
                output_csv_path = get_next_sequence_path(output_folder)
                process_video_to_csv(video_path, output_csv_path)
    else:
        print(f"Input video directory '{video_folder}' not found. Please create it and place your videos there.")
        print("The model video directory does not contain a supported recording.")
    
    
    return {
        "success": True,
        "message": "Video tracing completed successfully."
    }
