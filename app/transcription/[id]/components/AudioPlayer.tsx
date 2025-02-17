"use client";

import React, { forwardRef } from "react";
import "./AudioPlayer.css";

interface AudioPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (time: number) => void;
}

const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  ({ audioUrl, onTimeUpdate }, ref) => {
    if (!audioUrl) {
      return (
        <div className="audio-player-container">
          <p className="text-gray-500 text-center">Аудио не доступно</p>
        </div>
      );
    }

    return (
      <div className="audio-player-container">
        <audio
          ref={ref}
          controls
          src={audioUrl}
          preload="auto"
          onTimeUpdate={(e) => {
            const audio = e.currentTarget;
            onTimeUpdate?.(audio.currentTime);
          }}
        />
      </div>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;
