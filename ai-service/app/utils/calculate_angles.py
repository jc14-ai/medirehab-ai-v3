import math

def calculate_angles(landmarks):
    left = arm_angle(
        landmarks["Left Shoulder"],
        landmarks["Left Elbow"]
    )

    right = arm_angle(
        landmarks["Right Shoulder"],
        landmarks["Right Elbow"]
    )
    
    return left, right

def arm_angle(shoulder, elbow):
    dx = elbow["x"] - shoulder["x"]
    dy = shoulder["y"] - elbow["y"]

    return math.degrees(math.atan2(dy, dx))