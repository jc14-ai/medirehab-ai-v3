-- Exercise catalog and patient assignment workflow.
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercise_images" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "imageName" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_images_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercise_assignments" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "patientProfileId" TEXT NOT NULL,
    "assignedByDoctorId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercise_results" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_results_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");
CREATE INDEX "exercises_isActive_idx" ON "exercises"("isActive");
CREATE INDEX "exercise_images_exerciseId_idx" ON "exercise_images"("exerciseId");
CREATE UNIQUE INDEX "exercise_assignments_exerciseId_patientProfileId_key" ON "exercise_assignments"("exerciseId", "patientProfileId");
CREATE INDEX "exercise_assignments_patientProfileId_archivedAt_idx" ON "exercise_assignments"("patientProfileId", "archivedAt");
CREATE INDEX "exercise_assignments_assignedByDoctorId_idx" ON "exercise_assignments"("assignedByDoctorId");
CREATE UNIQUE INDEX "exercise_results_assignmentId_key" ON "exercise_results"("assignmentId");

ALTER TABLE "exercise_images" ADD CONSTRAINT "exercise_images_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_assignments" ADD CONSTRAINT "exercise_assignments_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_assignments" ADD CONSTRAINT "exercise_assignments_patientProfileId_fkey" FOREIGN KEY ("patientProfileId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_assignments" ADD CONSTRAINT "exercise_assignments_assignedByDoctorId_fkey" FOREIGN KEY ("assignedByDoctorId") REFERENCES "doctor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "exercise_results" ADD CONSTRAINT "exercise_results_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "exercise_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
