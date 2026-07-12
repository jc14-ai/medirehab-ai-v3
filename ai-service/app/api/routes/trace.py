from fastapi import APIRouter
from ultralytics import YOLO
import csv
import cv2
import os

from app.utils.process_video import process_video_to_csv, get_next_sequence_path

router = APIRouter(
    prefix="/trace",
    tags=["trace"]
)

@router.get("/{user_id}/{exercise_id}")
def trace(user_id: str, exercise_id: str):
    
    video_folder = f"data/videos/user_{user_id}/exercise_{exercise_id}"
    output_folder = f"data/trace/user_{user_id}/exercise_{exercise_id}"
    
    if os.path.exists(video_folder):
        for filename in sorted(os.listdir(video_folder)):
            if filename.endswith((".mp4", ".avi", ".mov", ".mkv")):
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