"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import AudioPlayer from "./components/AudioPlayer";
import SpeakersList from "./components/SpeakersList";
import "./styles.css";
import TranscriptionSegments from "./components/TranscriptionSegments";

interface Transcription {
  id: string;
  status: string;
  audioUrl: string;
  fileName: string;
  createdAt: string;
  language: string;
  duration: number;
  segments: Array<{
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    speaker?: string;
    confidence: number;
  }>;
}

export default function TranscriptionPage() {
  const params = useParams();
  const [transcription, setTranscription] = useState<Transcription | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const response = await fetch(`/api/transcription/${params.id}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch transcription");
        }
        const data = await response.json();
        console.log("Fetched transcription data:", data);
        setTranscription(data);
      } catch (err) {
        console.error("Error fetching transcription:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTranscription();
    }
  }, [params.id]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleSegmentClick = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  if (loading) {
    return <div className="loading">Loading transcription...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!transcription) {
    return <div className="not-found">Transcription not found</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} минут`;
  };

  return (
    <div className="transcription-page">
      <div className="transcription-header">
        <div className="file-info">
          <h1 className="file-name">{transcription.fileName}</h1>
          <div className="file-meta">
            <span className="meta-item">
              <span className="meta-icon">📅</span>
              {formatDate(transcription.createdAt)}
            </span>
            <span className="meta-item">
              <span className="meta-icon">🌐</span>
              {transcription.language === "ru"
                ? "Русский язык"
                : transcription.language}
            </span>
            <span className="meta-item">
              <span className="meta-icon">⏱</span>
              {formatDuration(transcription.duration)}
            </span>
          </div>
        </div>
      </div>

      <div className="transcription-container">
        <div className="transcription-content">
          <TranscriptionSegments
            segments={transcription.segments}
            onTimeClick={handleSegmentClick}
          />
        </div>
        <div className="speakers-sidebar">
          <SpeakersList transcriptionId={transcription.id} />
        </div>
      </div>

      <div className="audio-player-container">
        <AudioPlayer
          ref={audioRef}
          audioUrl={transcription.audioUrl}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>
    </div>
  );
}
