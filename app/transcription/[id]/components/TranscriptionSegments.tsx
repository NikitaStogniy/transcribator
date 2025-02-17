import React from "react";
import { Segment } from "../../../../types/transcript";
import "./TranscriptionSegments.css";

interface TranscriptionSegmentsProps {
  segments: Segment[];
  onTimeClick?: (time: number) => void;
}

const formatTime = (ms: number): string => {
  const date = new Date(ms);
  return date.toISOString().substr(11, 8);
};

const TranscriptionSegments: React.FC<TranscriptionSegmentsProps> = ({
  segments,
  onTimeClick,
}) => {
  if (!segments || segments.length === 0) {
    return (
      <div className="transcription-empty">
        <div className="empty-message">
          <span className="empty-icon">📝</span>
          <p>Сегменты транскрипции отсутствуют</p>
          <p className="empty-description">
            Возможно, транскрипция еще обрабатывается или произошла ошибка
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="transcription-segments">
      {segments.map((segment) => (
        <div key={segment.id} className="segment">
          <div className="segment-header">
            <span
              className="segment-time"
              onClick={() => onTimeClick?.(segment.startTime)}
            >
              {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
            </span>
          </div>
          <div className="segment-content">
            {segment.speaker && (
              <span className="segment-speaker">{segment.speaker}</span>
            )}
            <p className="segment-text">{segment.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptionSegments;
