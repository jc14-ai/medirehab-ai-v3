import torch
import numpy as np

def get_reconstruction_error(model, sequence):
    """
    Computes reconstruction error (MSE) for a sequence.
    """
    model.eval()
    with torch.no_grad():
        if isinstance(sequence, np.ndarray):
            sequence = torch.tensor(sequence, dtype=torch.float32)
        if len(sequence.shape) == 2:
            sequence = sequence.unsqueeze(0)
        device = next(model.parameters()).device
        sequence = sequence.to(device)
        output = model(sequence)
        error = torch.mean((output - sequence) ** 2)
        return error.item()

def compute_similarity_score(error, mean_val_loss, beta):
    """
    Computes the similarity score based on reconstruction error using calibrated exponential decay.
    """
    if error <= mean_val_loss:
        return 100.0
    score = 100.0 * np.exp(-beta * (error - mean_val_loss))
    return round(float(np.clip(score, 0.0, 100.0)), 2)

def get_score_feedback(score: float, exercise_id: str) -> list[str]:
    """
    Classifies the score into levels and returns fixed feedback sentences,
    personalized to the exercise being performed.
    """
    from app.utils.exercise_config import get_exercise_config
    config = get_exercise_config(exercise_id)
    normalized_id = exercise_id.lower().replace(" ", "_")

    if normalized_id == "shoulder_flexion":
        if score >= 90.0:
            return ["Excellent execution of the Shoulder Flexion. You maintained steady control and reached the correct peak height."]
        elif score >= 75.0:
            return ["Good form. Try to ensure you raise your arms straight forward exactly to shoulder level without rushing."]
        elif score >= 50.0:
            return ["Ensure you are lifting your arms straight forward to shoulder level. Try to keep both arms synchronized."]
        else:
            return ["Focus on raising your arms straight forward to shoulder height, hold for a moment, and lower them slowly."]

    elif normalized_id == "shoulder_abduction":
        if score >= 90.0:
            return ["Excellent execution of the Shoulder Abduction. You maintained steady control and reached the correct lateral height."]
        elif score >= 75.0:
            return ["Good form. Focus on keeping your arms straight as you raise them sideways to shoulder level."]
        elif score >= 50.0:
            return ["Make sure you raise your arms sideways to shoulder level. Check that your left and right arms are moving at the same pace."]
        else:
            return ["Focus on lifting your arms sideways to shoulder height, avoiding any shrugging, and lower them slowly."]

    else:
        if score >= 90.0:
            return ["Excellent form! You maintained steady control and achieved the target range of motion."]
        elif score >= 75.0:
            return ["Good effort. Focus on maintaining a steady pace and correct joint alignment."]
        elif score >= 50.0:
            return ["Pay closer attention to your range of motion and try to keep your movements smooth and steady."]
        else:
            return ["Focus on the basic movement pattern. Try to control your pace and complete the full range of motion."]