import os
os.environ["OPENCV_FFMPEG_LOGLEVEL"] = "-8"

from ultralytics import YOLO
import cv2
import csv
import torch

# Use MPS (Metal Performance Shaders) on Apple Silicon if available to accelerate inference
device = "mps" if torch.backends.mps.is_available() else "cpu"
model = YOLO("yolo26s-pose.pt")

BODY_PARTS = [
    "Nose", "Left Eye", "Right Eye", "Left Ear", "Right Ear",
    "Left Shoulder", "Right Shoulder",
    "Left Elbow", "Right Elbow",
    "Left Wrist", "Right Wrist",
    "Left Hip", "Right Hip",
    "Left Knee", "Right Knee",
    "Left Ankle", "Right Ankle"
]

keep_indices = [5, 6, 7, 8]

def process_video_to_csv(video_path, output_csv_path):
    """
    Reads a video file frame-by-frame, runs YOLO Pose estimation, 
    and saves keypoint coordinates of shoulders and elbows to a CSV file.
    """
    print(f"Processing video: {video_path}...")
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return
        
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    
    with open(output_csv_path, "w", newline="") as file:
        writer = csv.writer(file)
        
        # CSV Header
        header = ["frame"]
        for idx in keep_indices:
            part = BODY_PARTS[idx]
            header += [f"{part}_x", f"{part}_y"]
        writer.writerow(header)
        
        frame_id = 0
        frame_stride = 3  # Process every 3rd frame to speed up processing by 3x on macOS
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_id % frame_stride == 0:
                results = model(frame, verbose=False, device=device)
                keypoints = results[0].keypoints
                
                if keypoints is not None and keypoints.xy is not None and len(keypoints.xy) > 0:
                    xy = keypoints.xy[0]
                    
                    row = [frame_id]
                    for idx in keep_indices:
                        x = xy[idx][0].item() / width
                        y = xy[idx][1].item() / height
                        row += [x, y]
                    writer.writerow(row)
                
            frame_id += 1
            
    cap.release()
    print(f"Finished processing. Saved keypoints to {output_csv_path}\n")

def get_next_sequence_path(output_folder):
    """
    Finds the next available sequence file name (e.g., seq5.csv) in the target folder.
    """
    os.makedirs(output_folder, exist_ok=True)
    i = 1
    while True:
        path = os.path.join(output_folder, f"seq{i}.csv")
        if not os.path.exists(path):
            return path
        i += 1