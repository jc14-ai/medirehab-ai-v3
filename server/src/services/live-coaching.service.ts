import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import type { LiveCoachingEvent } from "../utils/liveCoachingValidation";

const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "coach-qwen:latest";
const DEFAULT_OLLAMA_TIMEOUT_MS = 5_000;
const DEFAULT_OLLAMA_KEEP_ALIVE = "10m";
const MAX_COACHING_WORDS = 10;
const DISALLOWED_COACHING_WORDS = /\b(?:complete|completed|finish|finished|done|pain|dizzy|dizziness|medical|doctor|error|left|right|arm|shoulder|elbow|wrist|push|hard|stronger|force|intense|intensity|faster|higher|lower|further|goals?)\b/i;

type OllamaChatResponse = {
    message?: {
        content?: unknown;
    };
};

const COACH_SYSTEM_PROMPT = [
    "You are a warm, short exercise coach.",
    "Return exactly one encouragement sentence, maximum 10 words.",
    "Never give movement directions.",
    "Never mention body parts, errors, corrections, completion, pain, or medical advice.",
    "Never encourage intensity, force, pushing harder, or faster movement.",
    "Use only the verified praise. Return only the sentence."
].join(" ");

const praiseForEvent = (event: LiveCoachingEvent): string => {
    switch (event) {
        case "issue_resolved":
            return "The patient corrected a movement issue.";
        case "repetition_completed":
            return "The patient completed a controlled repetition.";
    }
};

const fallbackForEvent = (event: LiveCoachingEvent): string => {
    switch (event) {
        case "issue_resolved":
            return "Nice adjustment. Keep moving with steady control.";
        case "repetition_completed":
            return "Great control on that repetition. Keep the pace smooth.";
    }
};

const getOllamaBaseUrl = (): string => {
    const configuredUrl = process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_OLLAMA_BASE_URL;

    try {
        return new URL(configuredUrl).toString().replace(/\/$/, "");
    } catch {
        throw new HttpError(503, "Live coaching is not configured correctly.");
    }
};

const getOllamaTimeoutMs = (): number => {
    const configuredTimeout = process.env.OLLAMA_TIMEOUT_MS?.trim();
    if (!configuredTimeout) return DEFAULT_OLLAMA_TIMEOUT_MS;

    const timeoutMs = Number(configuredTimeout);
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 30_000) {
        throw new HttpError(503, "Live coaching timeout is not configured correctly.");
    }

    return timeoutMs;
};

const isSafeCoachingMessage = (message: string): boolean => {
    const wordCount = message.trim().split(/\s+/).filter(Boolean).length;
    return wordCount > 0 && wordCount <= MAX_COACHING_WORDS && !DISALLOWED_COACHING_WORDS.test(message);
};

const requestCoachingMessage = async (
    exerciseName: string,
    event: LiveCoachingEvent
): Promise<string | null> => {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), getOllamaTimeoutMs());

    try {
        const response = await fetch(`${getOllamaBaseUrl()}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: abortController.signal,
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL?.trim() || DEFAULT_OLLAMA_MODEL,
                stream: false,
                think: false,
                keep_alive: process.env.OLLAMA_KEEP_ALIVE?.trim() || DEFAULT_OLLAMA_KEEP_ALIVE,
                options: {
                    temperature: 0.2,
                    num_predict: 24
                },
                messages: [
                    { role: "system", content: COACH_SYSTEM_PROMPT },
                    {
                        role: "user",
                        content: `Exercise: ${exerciseName}\nVerified praise: ${praiseForEvent(event)}`
                    }
                ]
            })
        });

        if (!response.ok) return null;

        const payload = await response.json() as OllamaChatResponse;
        const message = typeof payload.message?.content === "string"
            ? payload.message.content.trim().replaceAll(/\s+/g, " ")
            : "";

        return isSafeCoachingMessage(message) ? message : null;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
};

export const createLiveCoachingMessage = async (
    patientUserId: string,
    exerciseId: string,
    assignmentId: string,
    event: LiveCoachingEvent
): Promise<{ message: string; source: "ollama" | "fallback" }> => {
    const assignment = await prisma.exerciseAssignment.findFirst({
        where: {
            id: assignmentId,
            exerciseId,
            archivedAt: null,
            patientProfile: { is: { userId: patientUserId } },
            exercise: { is: { isActive: true, archivedAt: null } }
        },
        select: { exercise: { select: { name: true } } }
    });

    if (!assignment) {
        throw new HttpError(404, "Assigned exercise not found.");
    }

    const message = await requestCoachingMessage(assignment.exercise.name, event);
    return message
        ? { message, source: "ollama" }
        : { message: fallbackForEvent(event), source: "fallback" };
};
