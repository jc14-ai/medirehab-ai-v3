import uuid
import subprocess

from fastapi import APIRouter, UploadFile, File
import os

from app.utils.process_video import process_video_to_csv, get_next_sequence_path

router = APIRouter(
    prefix="/trace",
    tags=["trace"]
)

@router.post("/{user_id}/{exercise_id}")
async def trace(user_id: str, exercise_id: str, video: UploadFile = File(...)):
    
    video_folder = f"data/videos/user_{user_id}/exercise_{exercise_id}"
    
    os.makedirs(video_folder, exist_ok=True)
    
    filename = f"{uuid.uuid4()}.webm"
    file_path = os.path.join(video_folder, filename)
    
    with open(file_path, "wb") as f:
        f.write( await video.read())
        
    # Remux using FFmpeg to fix container headers/indices and avoid OpenCV warnings
    temp_path = file_path + ".temp.webm"
    try:
        os.rename(file_path, temp_path)
        subprocess.run([
            "ffmpeg", "-y", "-i", temp_path, "-c", "copy", file_path
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        if os.path.exists(temp_path):
            os.remove(temp_path)
    except Exception as e:
        # Fallback to the original file if ffmpeg is missing or fails
        if os.path.exists(temp_path):
            if os.path.exists(file_path):
                os.remove(temp_path)
            else:
                os.rename(temp_path, file_path)
    
    output_folder = f"data/trace/user_{user_id}/exercise_{exercise_id}"
    
    os.makedirs(output_folder, exist_ok=True)
    
    output_csv_path = get_next_sequence_path(output_folder)
    process_video_to_csv(file_path, output_csv_path)
    
    
    return {
        "success": True,
        "message": "Video tracing completed successfully."
    }