import { useCallback } from "react";
import AudioPlayer from "./components/AudioPlayer";
import TranscriptionSegments from "./components/TranscriptionSegments";
import "./components/TranscriptionSegments.css";

export default function TranscriptionResults({ transcriptData }) {
  const handleTimeClick = useCallback((time) => {
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      audioElement.currentTime = time / 1000;
      audioElement.play();
    }
  }, []);

  return (
    <div className="transcription-results">
      <AudioPlayer audioUrl={transcriptData?.audioUrl} />
      <div className="mt-4">
        <TranscriptionSegments
          segments={transcriptData?.segments || []}
          onTimeClick={handleTimeClick}
        />
      </div>
    </div>
  );
}
