"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TranscriptionResults from "./TranscriptionResults";

export default function TranscriptionPage() {
  const { id } = useParams();
  const [status, setStatus] = useState("loading");
  const [transcriptData, setTranscriptData] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [isCreatingSummary, setIsCreatingSummary] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(
    "Создай краткое содержание этой транскрипции, выдели основные моменты и ключевые идеи"
  );

  // Функция для создания нового summary
  const createNewSummary = async () => {
    setIsCreatingSummary(true);
    try {
      const res = await fetch(`/api/transcript/lemur/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: customPrompt,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setSummaries((prev) => [
          ...prev,
          {
            text: data.result,
            prompt: customPrompt,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Ошибка при создании summary:", error);
    } finally {
      setIsCreatingSummary(false);
    }
  };

  // Опрос статуса транскрипции
  useEffect(() => {
    if (!id) return;

    let isFirstLoad = true;
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

          // Генерируем summary только при первой загрузке завершенной транскрипции
          if (isFirstLoad && data.status === "completed") {
            try {
              await fetch(`/api/transcript/${id}/generate-summary`, {
                method: "POST",
              });
              // Получаем обновленные данные с summary
              const updatedRes = await fetch(`/api/transcript/${id}`);
              const updatedData = await updatedRes.json();
              setSummaries(
                [updatedData.summary_template1, updatedData.lemurResponse] || []
              );
            } catch (error) {
              console.error("Ошибка при генерации summary:", error);
            }
          } else {
            setSummaries([data.summary_template1, data.lemurResponse] || []);
          }
        }
      } catch (error) {
        console.error("Ошибка получения статуса транскрипции", error);
      } finally {
        isFirstLoad = false;
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
        <>
          <div className="mb-4 space-y-4">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="prompt"
                className="text-sm font-medium text-gray-700"
              >
                Prompt для создания summary:
              </label>
              <textarea
                id="prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                disabled={isCreatingSummary}
              />
            </div>
            <button
              onClick={createNewSummary}
              disabled={isCreatingSummary || !customPrompt.trim()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingSummary
                ? "Создаём summary..."
                : "Создать новое summary"}
            </button>
          </div>
          <TranscriptionResults
            transcriptData={transcriptData}
            summaries={summaries}
          />
        </>
      )}
    </div>
  );
}
