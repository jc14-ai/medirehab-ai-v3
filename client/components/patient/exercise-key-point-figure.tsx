"use client";

import type { ExerciseKeyPointVisibility } from "@/lib/pose/exercise-key-points";

interface ExerciseKeyPointFigureProps {
    points: ExerciseKeyPointVisibility[];
}

const MARKER_POSITIONS: Record<
    ExerciseKeyPointVisibility["id"],
    { cx: number; cy: number }
> = {
    nose: { cx: 50, cy: 13 },
    leftShoulder: { cx: 40, cy: 27 },
    rightShoulder: { cx: 60, cy: 27 },
    leftElbow: { cx: 31, cy: 43 },
    rightElbow: { cx: 69, cy: 43 },
    leftWrist: { cx: 28, cy: 59 },
    rightWrist: { cx: 72, cy: 59 },
    leftHip: { cx: 43, cy: 55 },
    rightHip: { cx: 57, cy: 55 },
    leftKnee: { cx: 42, cy: 76 },
    rightKnee: { cx: 58, cy: 76 },
    leftAnkle: { cx: 40, cy: 94 },
    rightAnkle: { cx: 60, cy: 94 },
};

export function ExerciseKeyPointFigure({ points }: ExerciseKeyPointFigureProps) {
    const requiredPoints = points.filter((point) => point.isRequired);
    const requiredPointIds = new Set(requiredPoints.map((point) => point.id));
    const visibleCount = requiredPoints.filter((point) => point.isVisible).length;

    return (
        <div
            aria-label="Required body point visibility"
            style={{
                position: "absolute",
                top: "52px",
                right: "16px",
                width: "min(210px, calc(100% - 32px))",
                padding: "10px",
                borderRadius: "12px",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                color: "#FFF",
                zIndex: 10,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                }}
            >
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "rgba(255, 255, 255, 0.72)",
                    }}
                >
                    Key points
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.72)" }}>
                    {visibleCount}/{requiredPoints.length}
                </div>
            </div>

            <svg
                viewBox="0 0 100 110"
                role="img"
                aria-label="Body figure showing required visible points"
                style={{
                    width: "100%",
                    height: "142px",
                    display: "block",
                }}
            >
                <path
                    d="M50 7 C43 7 39 12 39 19 C39 25 43 30 50 30 C57 30 61 25 61 19 C61 12 57 7 50 7Z"
                    fill="rgba(248, 250, 252, 0.08)"
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth="1.8"
                />
                <path
                    d="M41 29 L35 35 L30 56 M59 29 L65 35 L70 56 M37 35 L43 56 L40 96 M63 35 L57 56 L60 96 M43 56 L57 56 M50 31 L50 56"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.46)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M40 96 L35 101 M60 96 L65 101"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.46)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                {points.map((point) => {
                    if (!requiredPointIds.has(point.id)) return null;
                    const position = MARKER_POSITIONS[point.id];

                    return (
                        <circle
                            key={point.id}
                            cx={position.cx}
                            cy={position.cy}
                            r="4.5"
                            fill={point.isVisible ? "#22C55E" : "#EF4444"}
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                        >
                            <title>{`${point.label}: ${point.isVisible ? "visible" : "not visible"}`}</title>
                        </circle>
                    );
                })}
            </svg>

            <div style={{ display: "grid", gap: "5px", marginTop: "8px" }}>
                {requiredPoints.map((point) => (
                    <div
                        key={point.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "rgba(255, 255, 255, 0.86)",
                        }}
                    >
                        <span
                            aria-hidden="true"
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "9999px",
                                backgroundColor: point.isVisible ? "#22C55E" : "#EF4444",
                                flex: "0 0 auto",
                            }}
                        />
                        {point.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
