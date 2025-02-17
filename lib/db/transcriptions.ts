import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { SupportedLanguage } from "@/lib/transcriptions";

export async function createTranscription(data: {
  userId: string;
  fileName: string;
  language: SupportedLanguage;
  participantsCount: number;
  status: string;
  createdAt: string;
}) {
  return await prisma.transcription.create({
    data: {
      ...data,
      audioUrl: "", // Will be updated after blob storage upload
    },
  });
}

export async function updateTranscriptionStatus(
  id: string,
  status: string,
  assemblyId?: string
) {
  return await prisma.transcription.update({
    where: { id },
    data: {
      status,
      ...(assemblyId ? { assemblyId } : {}),
    },
  });
}

export async function saveTranscriptionSegments(
  transcriptionId: string,
  segments: Array<{
    startTime: number;
    endTime: number;
    text: string;
    speaker?: string;
    confidence?: number;
  }>
) {
  return await prisma.transcriptionSegment.createMany({
    data: segments.map((segment) => ({
      transcriptionId,
      ...segment,
      originalText: segment.text,
    })),
  });
}

export async function updateTranscriptionMetadata(
  id: string,
  data: {
    audioUrl?: string;
    duration?: number;
    language?: string;
    summary?: string;
    topics?: Record<string, any>;
  }
) {
  return await prisma.transcription.update({
    where: { id },
    data,
  });
}

export async function getTranscription(id: string) {
  return await prisma.transcription.findUnique({
    where: { id },
    include: {
      segments: {
        orderBy: {
          startTime: "asc",
        },
      },
    },
  });
}

export async function updateSegment(
  id: string,
  data: {
    text: string;
  }
) {
  return await prisma.transcriptionSegment.update({
    where: { id },
    data,
  });
}

export async function getUserTranscriptions(userId: string) {
  return await prisma.transcription.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });
}
