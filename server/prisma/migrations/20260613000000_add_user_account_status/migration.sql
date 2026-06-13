-- Add account status fields for soft-delete/archive behavior.
ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");
