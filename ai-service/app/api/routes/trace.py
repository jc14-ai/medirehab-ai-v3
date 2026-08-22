import uuid

from fastapi import APIRouter, UploadFile, File
from ultralytics import YOLO
import csv
import cv2
import os
import numpy as np
from PIL import Image

from app.utils.calculate_angles import calculate_angles
from app.utils.process_video import process_video_to_csv, get_next_sequence_path
from app.utils.judge import judge
from app.utils.process_image import process_image
from app.utils.select_exercise import select_exercise
from app.utils.exercise_config import get_exercise_config
from app.utils.session_manager import session_manager

router = APIRouter(
    prefix="/trace",
    tags=["trace"]
)

@router.post("/realtime/{exercise}")
async def compute_realtime(exercise: str, session_id: str = "default", frame: UploadFile = File(...)):
    image = Image.open(frame.file)

    image = np.array(image)
    
    selected_exercise = get_exercise_config(exercise)
    
    landmarks = process_image(image)
    if not landmarks:
        return {
            "feedbacks": ["No person detected. Please stand in frame."],
            "current_phase": "UNKNOWN"
        }

    left, right = calculate_angles(landmarks)
    
    # Retrieve or create session for the user
    session = session_manager.get_or_create_session(session_id, exercise)
    
    feedbacks = judge(left, right, selected_exercise, session=session)

    return {
        "feedbacks": feedbacks,
        "current_phase": session.current_phase_id,
        "angles": {
            "left": left,
            "right": right
        }
    }

@router.post("/{user_id}/{exercise_id}")
async def trace(user_id: str, exercise_id: str, video: UploadFile = File(...)):
    
    video_folder = f"data/videos/user_{user_id}/exercise_{exercise_id}"
    
    os.makedirs(video_folder, exist_ok=True)
    
    filename = f"{uuid.uuid4()}.webm"
    file_path = os.path.join(video_folder, filename)
    
    with open(file_path, "wb") as f:
        f.write( await video.read())
    
    output_folder = f"data/trace/user_{user_id}/exercise_{exercise_id}"
    
    os.makedirs(output_folder, exist_ok=True)
    
    output_csv_path = get_next_sequence_path(output_folder)
    process_video_to_csv(file_path, output_csv_path)
    
    
    return {
        "success": True,
        "message": "Video tracing completed successfully."
    }