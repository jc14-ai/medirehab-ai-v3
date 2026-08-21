from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class AnalysisModelDefinition:
    checkpoint_path: Path
    input_frames: int
    features: tuple[str, ...]


MODEL_REGISTRY = {
    "side_arms_raise_v1": AnalysisModelDefinition(
        checkpoint_path=Path(__file__).resolve().parent
        / "models"
        / "side_arms_raise_v1.pth",
        input_frames=200,
        features=(
            "Left Shoulder_x",
            "Left Shoulder_y",
            "Right Shoulder_x",
            "Right Shoulder_y",
            "Left Elbow_x",
            "Left Elbow_y",
            "Right Elbow_x",
            "Right Elbow_y",
        ),
    )
}


def get_model_definition(model_key: str) -> AnalysisModelDefinition:
    try:
        return MODEL_REGISTRY[model_key]
    except KeyError as error:
        raise KeyError(f"Unsupported analysis model: {model_key}") from error
