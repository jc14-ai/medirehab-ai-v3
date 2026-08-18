EXERCISE_CONFIGS = {
    "shoulder_flexion": {
        "name": "Shoulder Flexion",
        "description": "Raise arms forward to shoulder level, then lower them.",
        "phases": [
            {
                "id": "START",
                "name": "Starting Position",
                "constraints": {
                    "left_shoulder": {"min": -15, "max": 25, "feedback_low": None, "feedback_high": "Lower your left arm to start position."},
                    "right_shoulder": {"min": -15, "max": 25, "feedback_low": None, "feedback_high": "Lower your right arm to start position."}
                },
                "transition": {
                    "type": "any_above",
                    "joints": ["left_shoulder", "right_shoulder"],
                    "threshold": 30,
                    "next_phase": "ASCENT"
                }
            },
            {
                "id": "ASCENT",
                "name": "Raising Arms",
                "constraints": {
                    "symmetry": {"max_diff": 20, "feedback_left_lag": "Raise your left arm higher.", "feedback_right_lag": "Raise your right arm higher."},
                    "direction": {"type": "positive", "feedback": "Continue raising your arms."}
                },
                "transition": {
                    "type": "any_above",
                    "joints": ["left_shoulder", "right_shoulder"],
                    "threshold": 80,
                    "next_phase": "PEAK"
                }
            },
            {
                "id": "PEAK",
                "name": "Peak / Hold Position",
                "constraints": {
                    "left_shoulder": {"min": 80, "max": 110, "feedback_low": "Raise your left arm higher.", "feedback_high": "Lower your left arm slightly."},
                    "right_shoulder": {"min": 80, "max": 110, "feedback_low": "Raise your right arm higher.", "feedback_high": "Lower your right arm slightly."}
                },
                "transition": {
                    "type": "both_below",
                    "joints": ["left_shoulder", "right_shoulder"],
                    "threshold": 75,
                    "next_phase": "DESCENT"
                }
            },
            {
                "id": "DESCENT",
                "name": "Lowering Arms",
                "constraints": {
                    "symmetry": {"max_diff": 20, "feedback_left_lag": "Lower your right arm slower.", "feedback_right_lag": "Lower your left arm slower."},
                    "direction": {"type": "negative", "feedback": "Continue lowering your arms."}
                },
                "transition": {
                    "type": "both_below",
                    "joints": ["left_shoulder", "right_shoulder"],
                    "threshold": 25,
                    "next_phase": "START"
                }
            }
        ]
    },
    "shoulder_abduction": {
        "name": "Shoulder Abduction",
        "description": "Raise arms sideways to shoulder level, then lower them.",
        "phases": [
            {
                "id": "START",
                "name": "Starting Position",
                "constraints": {
                    "left_shoulder": {"min": -15, "max": 25, "feedback_low": None, "feedback_high": "Lower your left arm to start position."},
                    "right_shoulder": {"min": -15, "max": 25, "feedback_low": None, "feedback_high": "Lower your right arm to start position."}
                },
                "transition": {
                    "type": "any_above",
                    "joints": ["left_shoulder", "right_shoulder"],
                    "threshold": 30,
                    "next_phase": "ASCENT"
                }
            },
            {
                "id": "ASCENT",
                "name": "Raising Arms Sideways",
                "constraints": {
                    "symmetry": {"max_diff": 20, "feedback_left_lag": "Raise your left arm higher.", "feedback_right_lag": "Raise your right arm higher."},
                    "direction": {"type": "positive", "feedback": "Continue raising your arms."}
                },
                "transition": {
                    "type": "any_above",
                    "joints": ["left_shoulder", "right_shoulder"],
                    "threshold": 80,
                    "next_phase": "PEAK"
                }
            },
            {
                "id": "PEAK",
                "name": "Peak / Hold Position",
                "constraints": {
                    "left_shoulder": {"min": 80, "max": 110, "feedback_low": "Raise your left arm higher.", "feedback_high": "Lower your left arm slightly."},
                    "right_shoulder": {"min": 80, "max": 110, "feedback_low": "Raise your right arm higher.", "feedback_high": "Lower your right arm slightly."}
                },
                "transition": {
                    "type": "both_below",
                    "joints": ["left_shoulder", "right_shoulder"],
                    "threshold": 75,
                    "next_phase": "DESCENT"
                }
            },
            {
                "id": "DESCENT",
                "name": "Lowering Arms",
                "constraints": {
                    "symmetry": {"max_diff": 20, "feedback_left_lag": "Lower your right arm slower.", "feedback_right_lag": "Lower your left arm slower."},
                    "direction": {"type": "negative", "feedback": "Continue lowering your arms."}
                },
                "transition": {
                    "type": "both_below",
                    "joints": ["left_shoulder", "right_shoulder"],
                    "threshold": 25,
                    "next_phase": "START"
                }
            }
        ]
    }
}

def get_exercise_config(exercise_id: str):
    if exercise_id not in EXERCISE_CONFIGS:
        normalized = exercise_id.lower().replace(" ", "_")
        return EXERCISE_CONFIGS.get(normalized, EXERCISE_CONFIGS["shoulder_flexion"])
    return EXERCISE_CONFIGS[exercise_id]
