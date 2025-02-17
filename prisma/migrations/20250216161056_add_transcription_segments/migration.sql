/*
  Warnings:

  - You are about to drop the column `durationSeconds` on the `Transcription` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `Transcription` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Transcription` table. All the data in the column will be lost.
  - You are about to drop the column `transcriptText` on the `Transcription` table. All the data in the column will be lost.
  - You are about to drop the `Entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SentimentAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `audioUrl` to the `Transcription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_transcriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_transcriptionId_fkey";

-- DropForeignKey
ALTER TABLE "SentimentAnalysis" DROP CONSTRAINT "SentimentAnalysis_transcriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_transcriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transcription" DROP CONSTRAINT "Transcription_userId_fkey";

-- AlterTable
ALTER TABLE "Transcription" DROP COLUMN "durationSeconds",
DROP COLUMN "fileSize",
DROP COLUMN "fileUrl",
DROP COLUMN "transcriptText",
ADD COLUMN     "audioUrl" TEXT NOT NULL,
ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "topics" JSONB,
ALTER COLUMN "status" DROP DEFAULT;

-- DropTable
DROP TABLE "Entity";

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "SentimentAnalysis";

-- DropTable
DROP TABLE "Topic";

-- DropTable
DROP TABLE "Transaction";

-- CreateTable
CREATE TABLE "TranscriptionSegment" (
    "id" TEXT NOT NULL,
    "transcriptionId" TEXT NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "text" TEXT NOT NULL,
    "speaker" TEXT,
    "confidence" DOUBLE PRECISION,
    "originalText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranscriptionSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranscriptionSegment_transcriptionId_idx" ON "TranscriptionSegment"("transcriptionId");

-- CreateIndex
CREATE INDEX "Transcription_userId_idx" ON "Transcription"("userId");

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptionSegment" ADD CONSTRAINT "TranscriptionSegment_transcriptionId_fkey" FOREIGN KEY ("transcriptionId") REFERENCES "Transcription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
