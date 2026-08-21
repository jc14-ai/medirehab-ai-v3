import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import type {
    PosePoint,
    PoseWorkerRequest,
    PoseWorkerResponse,
    UpperBodyLandmarks,
} from "@/lib/pose/pose-landmarker.types";

const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_ELBOW = 13;
const RIGHT_ELBOW = 14;

const workerScope = self as unknown as {
    onmessage: ((event: MessageEvent<PoseWorkerRequest>) => void) | null;
    postMessage: (message: PoseWorkerResponse) => void;
    close: () => void;
};

let poseLandmarker: PoseLandmarker | null = null;

workerScope.onmessage = async (event) => {
    const request = event.data;

    if (request.type === "close") {
        poseLandmarker?.close();
        poseLandmarker = null;
        workerScope.close();
        return;
    }

    if (request.type === "init") {
        try {
            const vision = await FilesetResolver.forVisionTasks(request.wasmBasePath);
            poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: request.modelAssetPath,
                    delegate: "CPU",
                },
                runningMode: "VIDEO",
                numPoses: 1,
                minPoseDetectionConfidence: 0.6,
                minPosePresenceConfidence: 0.6,
                minTrackingConfidence: 0.6,
                outputSegmentationMasks: false,
            });
            workerScope.postMessage({ type: "ready" });
        } catch (error) {
            workerScope.postMessage({
                type: "error",
                message: error instanceof Error ? error.message : "Unable to initialize pose tracking.",
            });
        }
        return;
    }

    if (!poseLandmarker) {
        request.bitmap.close();
        workerScope.postMessage({ type: "error", message: "Pose tracking is not ready." });
        return;
    }

    try {
        const result = poseLandmarker.detectForVideo(request.bitmap, request.timestamp);
        const pose = result.landmarks[0];
        workerScope.postMessage({
            type: "result",
            landmarks: pose ? selectUpperBodyLandmarks(pose) : null,
        });
    } catch (error) {
        workerScope.postMessage({
            type: "error",
            message: error instanceof Error ? error.message : "Pose tracking failed.",
        });
    } finally {
        request.bitmap.close();
    }
};

function selectUpperBodyLandmarks(
    landmarks: Array<{ x: number; y: number; visibility?: number }>,
): UpperBodyLandmarks {
    return {
        leftShoulder: toPosePoint(landmarks[LEFT_SHOULDER]),
        rightShoulder: toPosePoint(landmarks[RIGHT_SHOULDER]),
        leftElbow: toPosePoint(landmarks[LEFT_ELBOW]),
        rightElbow: toPosePoint(landmarks[RIGHT_ELBOW]),
    };
}

function toPosePoint(landmark: { x: number; y: number; visibility?: number }): PosePoint {
    return {
        x: landmark.x,
        y: landmark.y,
        visibility: landmark.visibility ?? 0,
    };
}
