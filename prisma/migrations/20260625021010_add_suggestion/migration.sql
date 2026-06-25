-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);
