import {
    getRequiredExerciseKeyPointVisibility,
    REQUIRED_VISIBILITY,
    type ExerciseKeyPointVisibility,
} from "./exercise-key-points";
import type { PoseLandmarkMap, PosePoint, UpperBodyLandmarks } from "./pose-landmarker.types";

export type SideArmsRaisePhase =
    | "positioning"
    | "ready"
    | "raising"
    | "top"
    | "lowering";

export interface SideArmsRaiseGuidanceState {
    phase: SideArmsRaisePhase;
    repetitions: number;
    consecutiveDownFrames: number;
    consecutiveTopFrames: number;
}

export interface SideArmsRaiseGuidanceSnapshot {
    state: SideArmsRaiseGuidanceState;
    message: string;
    hasReliablePose: boolean;
    justCompletedRepetition: boolean;
    keyPoints: ExerciseKeyPointVisibility[];
}

const REQUIRED_CONSECUTIVE_FRAMES = 2;
const SIDE_HEIGHT_DIFF_THRESHOLD = 0.25;
const SHOULDER_HEIGHT_LOW_THRESHOLD = 0.35;
const SHOULDER_HEIGHT_HIGH_THRESHOLD = -0.35;
const MIN_SIDE_REACH = 0.3;
const SIDE_ARMS_RAISE_EXERCISE_NAME = "Side Arms Raise";

export const INITIAL_SIDE_ARMS_RAISE_STATE: SideArmsRaiseGuidanceState = {
    phase: "positioning",
    repetitions: 0,
    consecutiveDownFrames: 0,
    consecutiveTopFrames: 0,
};

export function supportsSideArmsRaiseGuidance(exerciseName: string): boolean {
    return exerciseName.trim().toLowerCase().replaceAll(/[-_]+/g, " ") === "side arms raise";
}

export function updateSideArmsRaiseGuidance(
    previous: SideArmsRaiseGuidanceState,
    landmarks: PoseLandmarkMap | null,
): SideArmsRaiseGuidanceSnapshot {
    const upperBodyLandmarks = toUpperBodyLandmarks(landmarks);

    if (!upperBodyLandmarks || !hasReliableUpperBodyLandmarks(upperBodyLandmarks)) {
        return {
            state: {
                ...previous,
                consecutiveDownFrames: 0,
                consecutiveTopFrames: 0,
            },
            message: "Move fully into the frame so both shoulders and elbows are visible.",
            hasReliablePose: false,
            justCompletedRepetition: false,
            keyPoints: getRequiredExerciseKeyPointVisibility(
                SIDE_ARMS_RAISE_EXERCISE_NAME,
                landmarks,
            ),
        };
    }

    const shoulderWidth = distance(upperBodyLandmarks.leftShoulder, upperBodyLandmarks.rightShoulder);
    if (shoulderWidth < 0.05) {
        return {
            state: {
                ...previous,
                consecutiveDownFrames: 0,
                consecutiveTopFrames: 0,
            },
            message: "Face the camera and keep both shoulders visible.",
            hasReliablePose: false,
            justCompletedRepetition: false,
            keyPoints: getRequiredExerciseKeyPointVisibility(
                SIDE_ARMS_RAISE_EXERCISE_NAME,
                landmarks,
            ),
        };
    }

    const leftDrop = (upperBodyLandmarks.leftElbow.y - upperBodyLandmarks.leftShoulder.y) / shoulderWidth;
    const rightDrop = (upperBodyLandmarks.rightElbow.y - upperBodyLandmarks.rightShoulder.y) / shoulderWidth;
    const leftReach = Math.abs(upperBodyLandmarks.leftElbow.x - upperBodyLandmarks.leftShoulder.x) / shoulderWidth;
    const rightReach = Math.abs(upperBodyLandmarks.rightElbow.x - upperBodyLandmarks.rightShoulder.x) / shoulderWidth;

    const armsDown = leftDrop > 0.45 && rightDrop > 0.45;
    const armsAtShoulderHeight =
        Math.abs(leftDrop) < 0.3 &&
        Math.abs(rightDrop) < 0.3 &&
        leftReach > 0.35 &&
        rightReach > 0.35;

    const consecutiveDownFrames = armsDown
        ? Math.min(previous.consecutiveDownFrames + 1, REQUIRED_CONSECUTIVE_FRAMES)
        : 0;
    const consecutiveTopFrames = armsAtShoulderHeight
        ? Math.min(previous.consecutiveTopFrames + 1, REQUIRED_CONSECUTIVE_FRAMES)
        : 0;
    const confirmedDown = consecutiveDownFrames === REQUIRED_CONSECUTIVE_FRAMES;
    const confirmedTop = consecutiveTopFrames === REQUIRED_CONSECUTIVE_FRAMES;

    let phase = previous.phase;
    let repetitions = previous.repetitions;
    let justCompletedRepetition = false;

    switch (previous.phase) {
        case "positioning":
            if (confirmedDown) phase = "ready";
            break;
        case "ready":
            if (confirmedTop) phase = "top";
            else if (!armsDown) phase = "raising";
            break;
        case "raising":
            if (confirmedTop) phase = "top";
            else if (confirmedDown) phase = "ready";
            break;
        case "top":
            if (confirmedDown) {
                phase = "ready";
                repetitions += 1;
                justCompletedRepetition = true;
            } else if (!armsAtShoulderHeight) {
                phase = "lowering";
            }
            break;
        case "lowering":
            if (confirmedDown) {
                phase = "ready";
                repetitions += 1;
                justCompletedRepetition = true;
            } else if (confirmedTop) {
                phase = "top";
            }
            break;
    }

    const state = {
        phase,
        repetitions,
        consecutiveDownFrames,
        consecutiveTopFrames,
    };
    const correctionMessage = correctiveGuidanceMessage(
        state,
        leftDrop,
        rightDrop,
        leftReach,
        rightReach,
    );

    return {
        state,
        message: justCompletedRepetition
            ? guidanceMessage(state, justCompletedRepetition)
            : correctionMessage ?? guidanceMessage(state, justCompletedRepetition),
        hasReliablePose: true,
        justCompletedRepetition,
        keyPoints: getRequiredExerciseKeyPointVisibility(
            SIDE_ARMS_RAISE_EXERCISE_NAME,
            landmarks,
        ),
    };
}

function hasReliableUpperBodyLandmarks(landmarks: UpperBodyLandmarks): boolean {
    return Object.values(landmarks).every((point) => point.visibility >= REQUIRED_VISIBILITY);
}

function toUpperBodyLandmarks(landmarks: PoseLandmarkMap | null): UpperBodyLandmarks | null {
    const leftShoulder = landmarks?.leftShoulder;
    const rightShoulder = landmarks?.rightShoulder;
    const leftElbow = landmarks?.leftElbow;
    const rightElbow = landmarks?.rightElbow;

    if (
        !isPosePoint(leftShoulder)
        || !isPosePoint(rightShoulder)
        || !isPosePoint(leftElbow)
        || !isPosePoint(rightElbow)
    ) {
        return null;
    }

    return {
        leftShoulder,
        rightShoulder,
        leftElbow,
        rightElbow,
    };
}

function isPosePoint(point: PosePoint | undefined): point is PosePoint {
    return Boolean(point);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function guidanceMessage(
    state: SideArmsRaiseGuidanceState,
    justCompletedRepetition: boolean,
): string {
    if (justCompletedRepetition) {
        return `Repetition ${state.repetitions} complete. Raise both arms when ready.`;
    }

    switch (state.phase) {
        case "positioning":
            return "Start with both arms comfortably down at your sides.";
        case "ready":
            return "Raise both arms out to your sides.";
        case "raising":
            return "Continue toward shoulder height.";
        case "top":
            return "Shoulder height reached. Lower both arms slowly.";
        case "lowering":
            return "Continue lowering both arms in a controlled motion.";
    }
}

function correctiveGuidanceMessage(
    state: SideArmsRaiseGuidanceState,
    leftDrop: number,
    rightDrop: number,
    leftReach: number,
    rightReach: number,
): string | null {
    if (state.phase !== "raising" && state.phase !== "top") {
        return null;
    }

    if (leftReach < MIN_SIDE_REACH && rightReach < MIN_SIDE_REACH) {
        return "Reach both arms farther out to your sides.";
    }

    if (leftReach < MIN_SIDE_REACH) {
        return "Reach your left arm farther out to the side.";
    }

    if (rightReach < MIN_SIDE_REACH) {
        return "Reach your right arm farther out to the side.";
    }

    if (leftDrop - rightDrop > SIDE_HEIGHT_DIFF_THRESHOLD) {
        return "Raise your left arm higher to match your right arm.";
    }

    if (rightDrop - leftDrop > SIDE_HEIGHT_DIFF_THRESHOLD) {
        return "Raise your right arm higher to match your left arm.";
    }

    if (state.phase === "top") {
        if (leftDrop > SHOULDER_HEIGHT_LOW_THRESHOLD && rightDrop > SHOULDER_HEIGHT_LOW_THRESHOLD) {
            return "Raise both arms a little higher to shoulder height.";
        }

        if (leftDrop > SHOULDER_HEIGHT_LOW_THRESHOLD) {
            return "Raise your left arm a little higher to shoulder height.";
        }

        if (rightDrop > SHOULDER_HEIGHT_LOW_THRESHOLD) {
            return "Raise your right arm a little higher to shoulder height.";
        }

        if (leftDrop < SHOULDER_HEIGHT_HIGH_THRESHOLD && rightDrop < SHOULDER_HEIGHT_HIGH_THRESHOLD) {
            return "Lower both arms slightly back to shoulder height.";
        }

        if (leftDrop < SHOULDER_HEIGHT_HIGH_THRESHOLD) {
            return "Lower your left arm slightly back to shoulder height.";
        }

        if (rightDrop < SHOULDER_HEIGHT_HIGH_THRESHOLD) {
            return "Lower your right arm slightly back to shoulder height.";
        }
    }

    return null;
}
