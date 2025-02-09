"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TranscriptionResults from "./TranscriptionResults";

export default function TranscriptionPage() {
  const { id } = useParams();
  const [status, setStatus] = useState("loading");
  const [transcriptData, setTranscriptData] = useState(null);
  const [summary, setSummary] = useState(null);

  // Опрос статуса транскрипции
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transcript/${id}`);
        const data = await res.json();
        console.log("Полученные данные:", data);

        setStatus(data.status);
        if (data.status === "completed" || data.status === "error") {
          clearInterval(interval);
          setTranscriptData({
            ...data.transcript,
            audioUrl: data.audioUrl,
          });
          // Устанавливаем суммаризацию из данных
          setSummary(data.summary || data.summaryError);
        }
      } catch (error) {
        console.error("Ошибка получения статуса транскрипции", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  // Отладочный вывод текущего состояния
  useEffect(() => {
    console.log("Текущее состояние:", {
      status,
      transcriptData,
      audioUrl: transcriptData?.audioUrl,
    });
  }, [status, transcriptData]);

  return (
    <div className="container">
      <h1>Результаты транскрипции</h1>
      {status !== "completed" ? (
        <p>Транскрипция в процессе: {status}...</p>
      ) : (
        <TranscriptionResults
          transcriptData={transcriptData}
          summary={summary}
        />
      )}
    </div>
  );
}
