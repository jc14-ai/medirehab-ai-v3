import os
import pandas as pd
import numpy as np

def preprocess(folder, file):
    
    dataset = []

    seq = pd.read_csv(os.path.join(folder, file))
    seq = seq.drop(columns=["frame"])

    seq = normalize_pose(seq)
    seq = seq.to_numpy(dtype=np.float32)
    seq = resample_sequence(seq, target_frames=200)

    dataset.append(seq)

    data = np.array(dataset, dtype=np.float32)

    input_dim = data.shape[2]

    return data, input_dim

def normalize_pose(df):

    # Shoulder center
    center_x = (df["Left Shoulder_x"] + df["Right Shoulder_x"]) / 2
    center_y = (df["Left Shoulder_y"] + df["Right Shoulder_y"]) / 2

    # Shoulder width per frame
    sw_per_frame = np.sqrt(
        (df["Left Shoulder_x"] - df["Right Shoulder_x"]) ** 2 +
        (df["Left Shoulder_y"] - df["Right Shoulder_y"]) ** 2
    )
    
    # Use median shoulder width to be robust against outliers/failures
    shoulder_width = np.median(sw_per_frame)
    if shoulder_width < 1e-6:
        shoulder_width = 1e-6

    # Normalize every keypoint
    for col in df.columns:

        if col.endswith("_x"):
            df[col] = (df[col] - center_x) / shoulder_width

        elif col.endswith("_y"):
            df[col] = (df[col] - center_y) / shoulder_width

    return df

def resample_sequence(sequence, target_frames):
    """
    sequence: numpy array of shape (frames, features)
    target_frames: desired number of frames

    Returns:
        numpy array of shape (target_frames, features)
    """

    original_frames = sequence.shape[0]
    num_features = sequence.shape[1]

    # Original frame positions
    x_old = np.arange(original_frames)

    # New frame positions
    x_new = np.linspace(0, original_frames - 1, target_frames)

    # Output array
    resampled = np.zeros((target_frames, num_features), dtype=np.float32)

    # Interpolate each feature independently
    for i in range(num_features):
        resampled[:, i] = np.interp(
            x_new,
            x_old,
            sequence[:, i]
        )

    return resampled