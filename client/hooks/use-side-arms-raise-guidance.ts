"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
    INITIAL_SIDE_ARMS_RAISE_STATE,
    updateSideArmsRaiseGuidance,
    type SideArmsRaiseGuidanceState,
} from "@/lib/pose/side-arms-raise-guidance";
import type {
    PoseWorkerRequest,
    PoseWorkerResponse,
    UpperBodyLandmarks,
} from "@/lib/pose/pose-landmarker.types";

const TARGET_FRAME_INTERVAL_MS = 100;
const WASM_BASE_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_ASSET_PATH = "/models/pose_landmarker_lite.task";

type LiveGuidanceStatus = "disabled" | "loading" | "ready" | "error";

interface LiveGuidanceView {
    status: LiveGuidanceStatus;
    message: string;
    repetitions: number;
    hasReliablePose: boolean;
    justCompletedRepetition: boolean;
}

const DISABLED_VIEW: LiveGuidanceView = {
    status: "disabled",
    message: "",
    repetitions: 0,
    hasReliablePose: false,
    justCompletedRepetition: false,
};

const LOADING_VIEW: LiveGuidanceView = {
    status: "loading",
    message: "Preparing live guidance…",
    repetitions: 0,
    hasReliablePose: false,
    justCompletedRepetition: false,
};

export function useSideArmsRaiseGuidance(
    enabled: boolean,
    videoRef: RefObject<HTMLVideoElement | null>,
    canvasRef: RefObject<HTMLCanvasElement | null>,
): LiveGuidanceView {
    const [view, setView] = useState<LiveGuidanceView>(DISABLED_VIEW);
    const guidanceStateRef = useRef<SideArmsRaiseGuidanceState>(INITIAL_SIDE_ARMS_RAISE_STATE);

    useEffect(() => {
        if (!enabled) {
            clearCanvas(canvasRef.current);
            return;
        }

        let disposed = false;
        let framePending = false;
        let workerReady = false;
        let lastFrameTime = 0;
        let animationFrameId = 0;
        const canvas = canvasRef.current;

        guidanceStateRef.current = INITIAL_SIDE_ARMS_RAISE_STATE;
        const resetViewFrameId = window.requestAnimationFrame(() => setView(LOADING_VIEW));

        const worker = new Worker(
            new URL("../workers/pose-landmarker.worker.ts", import.meta.url),
            { type: "module" },
        );

        const failGuidance = () => {
            if (disposed) return;
            workerReady = false;
            framePending = false;
            clearCanvas(canvas);
            setView({
                status: "error",
                message: "Live guidance is unavailable. Recording still works.",
                repetitions: guidanceStateRef.current.repetitions,
                hasReliablePose: false,
                justCompletedRepetition: false,
            });
        };

        worker.onmessage = (event: MessageEvent<PoseWorkerResponse>) => {
            if (disposed) return;

            if (event.data.type === "ready") {
                workerReady = true;
                setView({
                    status: "ready",
                    message: "Move fully into the frame so both shoulders and elbows are visible.",
                    repetitions: 0,
                    hasReliablePose: false,
                    justCompletedRepetition: false,
                });
                return;
            }

            if (event.data.type === "error") {
                failGuidance();
                return;
            }

            framePending = false;
            drawUpperBodyPose(canvas, videoRef.current, event.data.landmarks);
            const snapshot = updateSideArmsRaiseGuidance(
                guidanceStateRef.current,
                event.data.landmarks,
            );
            guidanceStateRef.current = snapshot.state;
            setView({
                status: "ready",
                message: snapshot.message,
                repetitions: snapshot.state.repetitions,
                hasReliablePose: snapshot.hasReliablePose,
                justCompletedRepetition: snapshot.justCompletedRepetition,
            });
        };

        worker.onerror = failGuidance;

        const initMessage: PoseWorkerRequest = {
            type: "init",
            modelAssetPath: new URL(MODEL_ASSET_PATH, window.location.origin).toString(),
            wasmBasePath: WASM_BASE_PATH,
        };
        worker.postMessage(initMessage);

        const sampleVideo = (now: number) => {
            animationFrameId = window.requestAnimationFrame(sampleVideo);
            const video = videoRef.current;
            if (
                disposed ||
                !workerReady ||
                framePending ||
                !video ||
                video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
                now - lastFrameTime < TARGET_FRAME_INTERVAL_MS
            ) {
                return;
            }

            framePending = true;
            lastFrameTime = now;
            createImageBitmap(video)
                .then((bitmap) => {
                    if (disposed) {
                        bitmap.close();
                        return;
                    }
                    const frameMessage: PoseWorkerRequest = {
                        type: "frame",
                        bitmap,
                        timestamp: now,
                    };
                    worker.postMessage(frameMessage, [bitmap]);
                })
                .catch(() => {
                    framePending = false;
                    failGuidance();
                });
        };

        animationFrameId = window.requestAnimationFrame(sampleVideo);

        return () => {
            disposed = true;
            window.cancelAnimationFrame(resetViewFrameId);
            window.cancelAnimationFrame(animationFrameId);
            const closeMessage: PoseWorkerRequest = { type: "close" };
            worker.postMessage(closeMessage);
            worker.terminate();
            clearCanvas(canvas);
        };
    }, [canvasRef, enabled, videoRef]);

    if (!enabled) return DISABLED_VIEW;
    return view.status === "disabled" ? LOADING_VIEW : view;
}

function drawUpperBodyPose(
    canvas: HTMLCanvasElement | null,
    video: HTMLVideoElement | null,
    landmarks: UpperBodyLandmarks | null,
): void {
    if (!canvas || !video) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const requiredWidth = Math.round(displayWidth * pixelRatio);
    const requiredHeight = Math.round(displayHeight * pixelRatio);

    if (canvas.width !== requiredWidth || canvas.height !== requiredHeight) {
        canvas.width = requiredWidth;
        canvas.height = requiredHeight;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, displayWidth, displayHeight);
    if (!landmarks || !video.videoWidth || !video.videoHeight) return;

    const coverScale = Math.max(
        displayWidth / video.videoWidth,
        displayHeight / video.videoHeight,
    );
    const renderedWidth = video.videoWidth * coverScale;
    const renderedHeight = video.videoHeight * coverScale;
    const offsetX = (displayWidth - renderedWidth) / 2;
    const offsetY = (displayHeight - renderedHeight) / 2;
    const toCanvasPoint = (point: { x: number; y: number }) => ({
        x: point.x * renderedWidth + offsetX,
        y: point.y * renderedHeight + offsetY,
    });

    const leftShoulder = toCanvasPoint(landmarks.leftShoulder);
    const rightShoulder = toCanvasPoint(landmarks.rightShoulder);
    const leftElbow = toCanvasPoint(landmarks.leftElbow);
    const rightElbow = toCanvasPoint(landmarks.rightElbow);

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 5;
    context.strokeStyle = "rgba(45, 212, 191, 0.95)";
    drawLine(context, leftElbow, leftShoulder);
    drawLine(context, leftShoulder, rightShoulder);
    drawLine(context, rightShoulder, rightElbow);

    for (const point of [leftElbow, leftShoulder, rightShoulder, rightElbow]) {
        context.beginPath();
        context.arc(point.x, point.y, 7, 0, Math.PI * 2);
        context.fillStyle = "#F8FAFC";
        context.fill();
        context.lineWidth = 4;
        context.strokeStyle = "#0F766E";
        context.stroke();
    }
}

function drawLine(
    context: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
): void {
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
}

function clearCanvas(canvas: HTMLCanvasElement | null): void {
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context?.clearRect(0, 0, canvas.width, canvas.height);
}
