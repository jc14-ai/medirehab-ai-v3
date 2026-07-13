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
    return float(np.clip(score, 0.0, 100.0))