config = {
  "shoulder_flexion": {
    "shoulder_angle": {
      "min": 85,
      "max": 95,
      "feedback_low": "Raise your arm higher.",
      "feedback_high": "Lower your arm slightly."
    }
  }
}

def select_exercise(exercise):
    return config[exercise]