import time
import numpy as np

class ExerciseSession:
    def __init__(self, exercise_id: str, window_size: int = 5):
        self.exercise_id = exercise_id
        self.window_size = window_size
        self.current_phase_id = "START"
        # Store raw or processed historical angles to compute smoothed angles and velocities
        self.history = {
            "left_shoulder": [],
            "right_shoulder": []
        }
        self.last_updated = time.time()

    def update(self, left_angle: float, right_angle: float):
        self.last_updated = time.time()
        
        # Add to history
        self.history["left_shoulder"].append(left_angle)
        self.history["right_shoulder"].append(right_angle)
        
        # Maintain window size (we keep up to 2 * window_size to compute previous window averages)
        max_len = max(10, self.window_size * 2)
        if len(self.history["left_shoulder"]) > max_len:
            self.history["left_shoulder"] = self.history["left_shoulder"][-max_len:]
            self.history["right_shoulder"] = self.history["right_shoulder"][-max_len:]
            
    def get_smoothed_angles_and_velocities(self):
        """
        Returns:
            smoothed_left, smoothed_right, velocity_left, velocity_right
        """
        left_vals = self.history["left_shoulder"]
        right_vals = self.history["right_shoulder"]
        
        if not left_vals:
            return 0.0, 0.0, 0.0, 0.0
            
        # Get moving average of last `window_size` elements
        w = min(len(left_vals), self.window_size)
        smoothed_left = float(np.mean(left_vals[-w:]))
        smoothed_right = float(np.mean(right_vals[-w:]))
        
        # Velocity is calculated over a short step
        if len(left_vals) >= 2:
            prev_w = min(len(left_vals) - 1, self.window_size)
            prev_left_vals = left_vals[:-1]
            prev_right_vals = right_vals[:-1]
            
            prev_smoothed_left = float(np.mean(prev_left_vals[-prev_w:]))
            prev_smoothed_right = float(np.mean(prev_right_vals[-prev_w:]))
            
            velocity_left = smoothed_left - prev_smoothed_left
            velocity_right = smoothed_right - prev_smoothed_right
        else:
            velocity_left = 0.0
            velocity_right = 0.0
            
        return smoothed_left, smoothed_right, velocity_left, velocity_right


class SessionManager:
    def __init__(self):
        self.sessions = {}
        
    def get_or_create_session(self, session_id: str, exercise_id: str) -> ExerciseSession:
        # Clean up old sessions (> 30 minutes idle)
        now = time.time()
        expired_sessions = [sid for sid, s in self.sessions.items() if now - s.last_updated > 1800]
        for sid in expired_sessions:
            del self.sessions[sid]
            
        if session_id not in self.sessions:
            self.sessions[session_id] = ExerciseSession(exercise_id)
        elif self.sessions[session_id].exercise_id != exercise_id:
            # If the exercise changed for this session, reset it
            self.sessions[session_id] = ExerciseSession(exercise_id)
            
        return self.sessions[session_id]

# Singleton instance
session_manager = SessionManager()
