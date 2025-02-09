"use client";

import { useRef, useEffect } from "react";

export default function AudioPlayer({ audioUrl, onTimeUpdate }) {
  const audioRef = useRef(null);
  console.log("audioUrl", audioUrl);
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.addEventListener("timeupdate", onTimeUpdate);
      return () => {
        audio.removeEventListener("timeupdate", onTimeUpdate);
      };
    }
  }, [onTimeUpdate]);

  return (
    <audio
      ref={audioRef}
      controls
      src={audioUrl}
      preload="auto"
      style={{ width: "100%", marginBottom: "20px" }}
    />
  );
}
