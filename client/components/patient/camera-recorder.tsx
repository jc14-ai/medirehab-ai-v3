"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useSideArmsRaiseGuidance } from "@/hooks/use-side-arms-raise-guidance";
import { supportsSideArmsRaiseGuidance } from "@/lib/pose/side-arms-raise-guidance";

interface CameraRecorderProps {
    exerciseName?: string;
    exerciseId: string;
    assignmentId?: string;
    onSave?: (blob: Blob) => void;
}

const MAX_RECORDING_SECONDS = 20;

export function CameraRecorder({ exerciseName = "Exercise", exerciseId, assignmentId, onSave}: CameraRecorderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluationScore, setEvaluationScore] = useState<number | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const poseCanvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const blobRef = useRef<Blob | null>(null);
    const liveGuidanceEnabled =
        isOpen &&
        Boolean(stream) &&
        !recordedUrl &&
        supportsSideArmsRaiseGuidance(exerciseName);
    const liveGuidance = useSideArmsRaiseGuidance(
        liveGuidanceEnabled,
        videoRef,
        poseCanvasRef,
    );

    // Clean up streams on unmount or close
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
            if (recordingTimeoutRef.current) {
                clearTimeout(recordingTimeoutRef.current);
            }
        };
    }, [stream]);

    const startCamera = async () => {
        setError(null);
        setRecordedUrl(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 10 },
                },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err: unknown) {
            console.error("Error accessing camera:", err);
            setError(
                "Could not access your front camera. Please check your camera permissions and ensure no other application is using it."
            );
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        startCamera();
    };

    const handleClose = () => {
        stopCamera();
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
        }
        if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
        }
        setCountdown(null);
        setIsRecording(false);
        setIsOpen(false);
        setError(null);
        setRecordedUrl(null);
        setIsEvaluating(false);
        setEvaluationScore(null);
        blobRef.current = null;
    };

    const initiateCountdown = () => {
        if (!stream) return;
        setCountdown(5);

        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev === null) return null;
                if (prev <= 1) {
                    clearInterval(countdownIntervalRef.current!);
                    startRecording();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startRecording = () => {
        if (!stream) return;
        chunksRef.current = [];

        try {
            const options = { mimeType: "video/webm;codecs=vp9" };
            let recorder: MediaRecorder;
            try {
                recorder = new MediaRecorder(stream, options);
            } catch {
                // Fallback for browsers that don't support VP9
                recorder = new MediaRecorder(stream);
            }

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                if (recordingTimeoutRef.current) {
                    clearTimeout(recordingTimeoutRef.current);
                    recordingTimeoutRef.current = null;
                }
                const mimeType = recorder.mimeType || "video/webm";
                const blob = new Blob(chunksRef.current, { type: mimeType });
                blobRef.current = blob;
                const url = URL.createObjectURL(blob);
                setRecordedUrl(url);
                stopCamera();
                if (onSave) {
                    onSave(blob);
                }
            };

            mediaRecorderRef.current = recorder;
            recorder.start(); // Start recording without timeslice for maximum stability
            setIsRecording(true);
            recordingTimeoutRef.current = setTimeout(() => {
                if (recorder.state === "recording") {
                    recorder.stop();
                    setIsRecording(false);
                }
            }, MAX_RECORDING_SECONDS * 1000);
        } catch (err) {
            console.error("Failed to start recording:", err);
            setError("Failed to initialize video recording.");
        }
    };

    const stopRecording = () => {
        if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
        }
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleEvaluate = async () => {
        if (!blobRef.current) return;
        if (!assignmentId) {
            setError("No assignment ID provided to evaluate.");
            return;
        }
        setIsEvaluating(true);
        setError(null);
        try {
            const res = await api.evaluateExercise(exerciseId, assignmentId, blobRef.current);
            if (res.success) {
                setEvaluationScore(res.score);
            } else {
                setError(res.message || "Failed to evaluate exercise.");
            }
        } catch (err: unknown) {
            const message = getErrorMessage(err, "An error occurred during evaluation.");
            console.warn("Evaluation request failed:", message);
            setError(message);
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <>
            <button className="btn btn-primary" onClick={handleOpen} style={{ height: "38px", padding: "0 14px" }}>
                Start Exercise
            </button>

            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.75)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        padding: "20px",
                    }}
                    onClick={handleClose}
                >
                    <div
                        className="card animate-slide-up"
                        style={{
                            width: "100%",
                            maxWidth: "960px",
                            backgroundColor: "var(--color-surface)",
                            overflow: "hidden",
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            boxShadow: "var(--shadow-elevated)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: "16px 20px",
                                borderBottom: "1px solid var(--color-border)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
                                    Record: {exerciseName}
                                </h3>
                                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "2px 0 0 0" }}>
                                    Align yourself in the frame before starting
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: "var(--color-text-muted)",
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "50%",
                                }}
                                className="btn-secondary"
                                aria-label="Close dialog"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Video Feed Workspace */}
                        <div
                            style={{
                                position: "relative",
                                backgroundColor: "#000",
                                aspectRatio: "16/9",
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {error ? (
                                <div style={{ color: "#EF4444", padding: "24px", textAlign: "center", fontSize: "14px" }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: "0 auto 12px auto", display: "block" }}>
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                    {error}
                                </div>
                            ) : evaluationScore !== null ? (
                                /* Evaluation Success Screen */
                                <div style={{ color: "#FFF", padding: "40px 24px", textAlign: "center" }}>
                                    <div style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(22, 163, 74, 0.2)",
                                        border: "3px solid #16A34A",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 20px auto",
                                        color: "#16A34A"
                                    }}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <h4 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0" }}>Evaluation Complete!</h4>
                                    <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 16px 0", fontSize: "14px" }}>
                                        Your exercise performance has been evaluated.
                                    </p>
                                    <div style={{ fontSize: "48px", fontWeight: 800, color: "#16A34A", margin: "16px 0" }}>
                                        {evaluationScore} <span style={{ fontSize: "20px", fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>/ 100</span>
                                    </div>
                                </div>
                            ) : recordedUrl ? (
                                /* Post-Recording Preview */
                                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                    <video
                                        src={recordedUrl}
                                        controls
                                        style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                                    />
                                    {isEvaluating && (
                                        <div style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: "rgba(15, 23, 42, 0.8)",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "16px",
                                            zIndex: 30
                                        }}>
                                            <div className="spinner spinner-white" style={{ width: "40px", height: "40px" }} />
                                            <div style={{ color: "#FFF", fontSize: "16px", fontWeight: 600 }}>Analyzing exercise performance...</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Live Camera Feed */
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            transform: "scaleX(-1)", // Mirror the front camera output
                                        }}
                                    />

                                    {liveGuidanceEnabled && (
                                        <>
                                            <canvas
                                                ref={poseCanvasRef}
                                                aria-hidden="true"
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                    pointerEvents: "none",
                                                    transform: "scaleX(-1)",
                                                    zIndex: 4,
                                                }}
                                            />
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "16px",
                                                    right: "16px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "7px",
                                                    padding: "6px 10px",
                                                    borderRadius: "9999px",
                                                    backgroundColor: "rgba(15, 23, 42, 0.72)",
                                                    color: "#FFF",
                                                    fontSize: "12px",
                                                    fontWeight: 700,
                                                    zIndex: 10,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: "8px",
                                                        height: "8px",
                                                        borderRadius: "50%",
                                                        backgroundColor:
                                                            liveGuidance.status === "ready"
                                                                ? "#2DD4BF"
                                                                : liveGuidance.status === "error"
                                                                  ? "#F59E0B"
                                                                  : "#94A3B8",
                                                    }}
                                                />
                                                Live guidance
                                            </div>
                                            <div
                                                aria-live="polite"
                                                style={{
                                                    position: "absolute",
                                                    left: "50%",
                                                    bottom: "18px",
                                                    transform: "translateX(-50%)",
                                                    width: "min(90%, 620px)",
                                                    padding: "10px 14px",
                                                    borderRadius: "12px",
                                                    backgroundColor: liveGuidance.justCompletedRepetition
                                                        ? "rgba(13, 148, 136, 0.9)"
                                                        : "rgba(15, 23, 42, 0.78)",
                                                    color: "#FFF",
                                                    textAlign: "center",
                                                    fontSize: "14px",
                                                    fontWeight: 600,
                                                    lineHeight: 1.4,
                                                    zIndex: 10,
                                                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
                                                }}
                                            >
                                                <div>{liveGuidance.message}</div>
                                                {liveGuidance.status === "ready" && (
                                                    <div
                                                        style={{
                                                            marginTop: "3px",
                                                            color: "rgba(255, 255, 255, 0.72)",
                                                            fontSize: "11px",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        Detected repetitions: {liveGuidance.repetitions}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Recording Status Overlay */}
                                    {isRecording && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "16px",
                                                left: "16px",
                                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                                                padding: "6px 12px",
                                                borderRadius: "9999px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                color: "#FFF",
                                                zIndex: 10,
                                            }}
                                        >
                                            <span
                                                className="animate-pulse-subtle"
                                                style={{
                                                    width: "8px",
                                                    height: "8px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "#EF4444",
                                                    display: "inline-block",
                                                }}
                                            />
                                            REC · {MAX_RECORDING_SECONDS}s max
                                        </div>
                                    )}

                                    {/* Countdown Timer Overlay */}
                                    {countdown !== null && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                zIndex: 20,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "84px",
                                                    fontWeight: 800,
                                                    color: "#FFF",
                                                    animation: "fadeIn 0.2s ease-out",
                                                    textShadow: "0 4px 12px rgba(0,0,0,0.5)",
                                                }}
                                            >
                                                {countdown}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Action Footer */}
                        <div
                            style={{
                                padding: "16px 20px",
                                borderTop: "1px solid var(--color-border)",
                                display: "flex",
                                justifyContent: "center",
                                gap: "12px",
                                backgroundColor: "var(--color-surface)",
                            }}
                        >
                            {error ? (
                                <button className="btn btn-secondary" onClick={startCamera}>
                                    Try Again
                                </button>
                            ) : evaluationScore !== null ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        handleClose();
                                        window.location.reload();
                                    }}
                                    style={{ minWidth: "140px" }}
                                >
                                    Done
                                </button>
                            ) : recordedUrl ? (
                                <>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setRecordedUrl(null);
                                            startCamera();
                                        }}
                                        disabled={isEvaluating}
                                    >
                                        Record Again
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleEvaluate}
                                        disabled={isEvaluating}
                                        style={{ minWidth: "140px" }}
                                    >
                                        {isEvaluating ? "Evaluating..." : "Evaluate"}
                                    </button>
                                </>
                            ) : countdown !== null ? (
                                <button className="btn btn-primary" disabled style={{ minWidth: "140px" }}>
                                    Starting in {countdown}s...
                                </button>
                            ) : isRecording ? (
                                <button
                                    className="btn btn-danger"
                                    onClick={stopRecording}
                                    style={{
                                        minWidth: "140px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: "10px",
                                            height: "10px",
                                            backgroundColor: "#FFF",
                                            borderRadius: "2px",
                                            display: "inline-block",
                                        }}
                                    />
                                    Stop Recording
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={initiateCountdown}
                                    disabled={!stream}
                                    style={{
                                        minWidth: "140px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: "12px",
                                            height: "12px",
                                            backgroundColor: "#FFF",
                                            borderRadius: "50%",
                                            display: "inline-block",
                                        }}
                                    />
                                    Start Recording
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}
