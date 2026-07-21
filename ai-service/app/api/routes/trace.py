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

router = APIRouter(
    prefix="/trace",
    tags=["trace"]
)

@router.post("/realtime/{exercise}")
async def compute_realtime(exercise:str, frame: UploadFile = File(...)):
    image = Image.open(frame.file)

    image = np.array(image)
    
    selected_exercise = select_exercise(exercise)
    
    landmarks = process_image(image)

    left, right = calculate_angles(landmarks)
    
    feedbacks = judge(left, right, selected_exercise)

    return {
        "feedbacks": feedbacks
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
    
    if os.path.exists(video_folder):
        for filename in sorted(os.listdir(video_folder)):
            if filename.endswith((".mp4", ".avi", ".mov", ".mkv", ".webm")):
                video_path = os.path.join(video_folder, filename)
                output_csv_path = get_next_sequence_path(output_folder)
                process_video_to_csv(video_path, output_csv_path)
    else:
        print(f"Input video directory '{video_folder}' not found. Please create it and place your videos there.")
        print("To run manually, call: process_video_to_csv('data/videos/user_{user_id}/exercise_{exercise_id}/video.mp4', 'data/trace/user_{user_id}/exercise_{exercise_id}/output.csv')")
    
    
    return {
        "success": True,
        "message": "Video tracing completed successfully."
    }