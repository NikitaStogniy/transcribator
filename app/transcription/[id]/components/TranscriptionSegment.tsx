"use client";

import { useState, useRef, useEffect } from "react";
import "./TranscriptionSegment.css";

interface Segment {
  id: string;
  transcriptionId: string;
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  confidence: number;
  originalText: string;
}

interface FormatOptions {
  highlightColor: string;
  speakerColor: string;
  timeColor: string;
  boldSpeaker: boolean;
  italicText: boolean;
  fontSize: number;
}

interface TranscriptionSegmentProps {
  segment: Segment;
  onTextChange: (segmentId: string, newText: string) => void;
  onTimeClick?: (time: number) => void;
  isHighlighted?: boolean;
  formatOptions: FormatOptions;
}

export default function TranscriptionSegment({
  segment,
  onTextChange,
  onTimeClick,
  isHighlighted = false,
  formatOptions,
}: TranscriptionSegmentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(segment.text);
  const [showFormatting, setShowFormatting] = useState(false);
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formattingRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleTextBlur = () => {
    if (editedText !== segment.text) {
      onTextChange(segment.id, editedText);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
  };

  const handleTimeClick = () => {
    if (onTimeClick) {
      onTimeClick(segment.startTime);
    }
  };

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        setSelection({ start, end });
        setShowFormatting(true);
      } else {
        setShowFormatting(false);
      }
    }
  };

  const applyFormatting = (format: "bold" | "highlight") => {
    if (selection && textareaRef.current) {
      const text = editedText;
      const prefix = format === "bold" ? "**" : "==";
      const newText =
        text.substring(0, selection.start) +
        prefix +
        text.substring(selection.start, selection.end) +
        prefix +
        text.substring(selection.end);

      setEditedText(newText);
      setShowFormatting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        formattingRef.current &&
        !formattingRef.current.contains(event.target as Node)
      ) {
        setShowFormatting(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const segmentStyle = {
    backgroundColor: isHighlighted
      ? formatOptions.highlightColor
      : "transparent",
  };

  const speakerStyle = {
    color: formatOptions.speakerColor,
    fontWeight: formatOptions.boldSpeaker ? "bold" : "normal",
  };

  const timeStyle = {
    color: formatOptions.timeColor,
  };

  const textStyle = {
    fontStyle: formatOptions.italicText ? "italic" : "normal",
  };

  return (
    <div
      className={`transcription-segment ${isHighlighted ? "highlighted" : ""}`}
      style={segmentStyle}
    >
      <div className="segment-header">
        {segment.speaker && (
          <span className="speaker" style={speakerStyle}>
            {segment.speaker}
          </span>
        )}
        <span className="time" style={timeStyle} onClick={handleTimeClick}>
          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
        </span>
        <div className="segment-controls">
          {segment.confidence < 0.8 && (
            <span
              className="confidence-indicator"
              title={`Confidence: ${Math.round(segment.confidence * 100)}%`}
            >
              ⚠️
            </span>
          )}
        </div>
      </div>
      <div className="segment-content" style={textStyle}>
        {isEditing ? (
          <div className="editor-container">
            <textarea
              ref={textareaRef}
              value={editedText}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onSelect={handleSelectionChange}
              autoFocus
            />
            {showFormatting && (
              <div className="formatting-controls" ref={formattingRef}>
                <button onClick={() => applyFormatting("bold")}>B</button>
                <button onClick={() => applyFormatting("highlight")}>H</button>
              </div>
            )}
          </div>
        ) : (
          <p onClick={handleTextClick}>
            {editedText.split(/(\*\*.*?\*\*|==.*?==)/).map((part, index) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith("==") && part.endsWith("==")) {
                return <mark key={index}>{part.slice(2, -2)}</mark>;
              }
              return part;
            })}
          </p>
        )}
      </div>
    </div>
  );
}
