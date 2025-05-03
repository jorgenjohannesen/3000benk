-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "benchKg" DOUBLE PRECISION NOT NULL,
    "runTimeSeconds" INTEGER,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);
