"use client";

import { useRef, useEffect } from "react";
import "./AudioPlayer.css";

export default function AudioPlayer({ audioUrl, onTimeUpdate }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && onTimeUpdate) {
      const audio = audioRef.current;
      audio.addEventListener("timeupdate", onTimeUpdate);
      return () => {
        audio.removeEventListener("timeupdate", onTimeUpdate);
      };
    }
  }, [onTimeUpdate]);

  if (!audioUrl) {
    return (
      <div className="audio-player-container">
        <p className="text-gray-500 text-center">Аудио не доступно</p>
      </div>
    );
  }

  return (
    <div className="audio-player-container">
      <audio ref={audioRef} controls src={audioUrl} preload="auto" />
    </div>
  );
}
