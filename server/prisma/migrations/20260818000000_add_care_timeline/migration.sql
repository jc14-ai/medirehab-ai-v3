-- Care timeline, doctor comments, patient check-ins, and notifications.
CREATE TYPE "NotificationType" AS ENUM ('SESSION_RESULT', 'SESSION_CHECKIN', 'DOCTOR_COMMENT', 'REMINDER');

CREATE TABLE "exercise_sessions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "aiFeedback" JSONB,
    "painLevel" INTEGER,
    "difficultyLevel" INTEGER,
    "confidenceLevel" INTEGER,
    "patientNote" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercise_session_comments" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isVisibleToPatient" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_session_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "exercise_sessions_assignmentId_performedAt_idx" ON "exercise_sessions"("assignmentId", "performedAt");
CREATE INDEX "exercise_sessions_patientUserId_performedAt_idx" ON "exercise_sessions"("patientUserId", "performedAt");
CREATE INDEX "exercise_session_comments_sessionId_createdAt_idx" ON "exercise_session_comments"("sessionId", "createdAt");
CREATE INDEX "exercise_session_comments_authorUserId_createdAt_idx" ON "exercise_session_comments"("authorUserId", "createdAt");
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");

ALTER TABLE "exercise_sessions" ADD CONSTRAINT "exercise_sessions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "exercise_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_sessions" ADD CONSTRAINT "exercise_sessions_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_session_comments" ADD CONSTRAINT "exercise_session_comments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "exercise_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_session_comments" ADD CONSTRAINT "exercise_session_comments_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
