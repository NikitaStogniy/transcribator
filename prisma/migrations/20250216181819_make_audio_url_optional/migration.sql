/*
  Warnings:

  - You are about to drop the column `summary` on the `Transcription` table. All the data in the column will be lost.
  - You are about to drop the column `topics` on the `Transcription` table. All the data in the column will be lost.
  - You are about to alter the column `duration` on the `Transcription` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "Transcription" DROP CONSTRAINT "Transcription_userId_fkey";

-- Update NULL values in language column
UPDATE "Transcription" SET language = 'ru' WHERE language IS NULL;

-- AlterTable
ALTER TABLE "Transcription" DROP COLUMN "summary",
DROP COLUMN "topics",
ADD COLUMN     "participantsCount" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "status" SET DEFAULT 'processing',
ALTER COLUMN "language" SET NOT NULL,
ALTER COLUMN "language" SET DEFAULT 'ru',
ALTER COLUMN "audioUrl" DROP NOT NULL,
ALTER COLUMN "duration" SET DATA TYPE INTEGER;

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
