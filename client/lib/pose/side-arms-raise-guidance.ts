import type { UpperBodyLandmarks } from "./pose-landmarker.types";

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
}

const REQUIRED_VISIBILITY = 0.6;
const REQUIRED_CONSECUTIVE_FRAMES = 2;

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
    landmarks: UpperBodyLandmarks | null,
): SideArmsRaiseGuidanceSnapshot {
    if (!landmarks || !hasReliableUpperBodyLandmarks(landmarks)) {
        return {
            state: {
                ...previous,
                consecutiveDownFrames: 0,
                consecutiveTopFrames: 0,
            },
            message: "Move fully into the frame so both shoulders and elbows are visible.",
            hasReliablePose: false,
            justCompletedRepetition: false,
        };
    }

    const shoulderWidth = distance(landmarks.leftShoulder, landmarks.rightShoulder);
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
        };
    }

    const leftDrop = (landmarks.leftElbow.y - landmarks.leftShoulder.y) / shoulderWidth;
    const rightDrop = (landmarks.rightElbow.y - landmarks.rightShoulder.y) / shoulderWidth;
    const leftReach = Math.abs(landmarks.leftElbow.x - landmarks.leftShoulder.x) / shoulderWidth;
    const rightReach = Math.abs(landmarks.rightElbow.x - landmarks.rightShoulder.x) / shoulderWidth;

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

    return {
        state,
        message: guidanceMessage(state, justCompletedRepetition),
        hasReliablePose: true,
        justCompletedRepetition,
    };
}

function hasReliableUpperBodyLandmarks(landmarks: UpperBodyLandmarks): boolean {
    return Object.values(landmarks).every((point) => point.visibility >= REQUIRED_VISIBILITY);
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
