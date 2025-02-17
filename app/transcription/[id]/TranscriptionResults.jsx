import { useRef, useState, useCallback } from "react";
import AudioPlayer from "./components/AudioPlayer";
import Transcript from "./components/Transcript";
import Summary from "./components/Summary";
import SentimentAnalysis from "./components/SentimentAnalysis";
import Topics from "./components/Topics";
import Entities from "./components/Entities";

export default function TranscriptionResults({ transcriptData, summaries }) {
  const [activeTab, setActiveTab] = useState("transcript");
  const transcriptContainerRef = useRef(null);

  const handleTimeUpdate = useCallback((event) => {
    if (!transcriptContainerRef.current) return;

    const currentTime = event.target.currentTime * 1000;
    const wordElements =
      transcriptContainerRef.current.querySelectorAll(".word");

    wordElements.forEach((span) => {
      const startTime = parseInt(span.getAttribute("data-start"), 10);
      if (currentTime >= startTime && currentTime < startTime + 500) {
        span.classList.add("active");
        span.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        span.classList.remove("active");
      }
    });
  }, []);

  // Проверяем доступность каждой функции
  const hasTranscript = Boolean(transcriptData?.words?.length);
  const hasSummary = Boolean(summaries?.length);
  const hasSentiment = Boolean(
    transcriptData?.sentiment_analysis_results?.length
  );
  const hasTopics = Boolean(transcriptData?.iab_categories_result?.results);
  const hasEntities = Boolean(transcriptData?.entities?.length);

  // Определяем, какие вкладки показывать
  const tabs = [
    { id: "transcript", label: "Транскрипция", available: hasTranscript },
    { id: "summary", label: "Краткое содержание", available: hasSummary },
    { id: "sentiment", label: "Анализ тональности", available: hasSentiment },
    // { id: "topics", label: "Категории", available: hasTopics },
    // { id: "entities", label: "Сущности", available: hasEntities },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "transcript":
        return (
          <Transcript
            ref={transcriptContainerRef}
            words={transcriptData?.words}
          />
        );
      case "summary":
        return (
          <div className="space-y-4">
            {summaries
              .filter(
                (summary) =>
                  summary !== undefined && summary !== null && summary !== ""
              )
              .map((summary, index, filteredArray) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">
                    Резюме #{filteredArray.length - index}
                  </h3>
                  <Summary summary={summary} />
                </div>
              ))
              .reverse()}
          </div>
        );
      case "sentiment":
        return (
          <SentimentAnalysis
            results={transcriptData?.sentiment_analysis_results}
          />
        );
      case "topics":
        return <Topics categories={transcriptData?.iab_categories_result} />;
      case "entities":
        return <Entities entities={transcriptData?.entities} />;
      default:
        return null;
    }
  };

  return (
    <div className="transcription-results">
      <AudioPlayer
        audioUrl={transcriptData?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="tabs">
        {tabs.map(
          (tab) =>
            tab.available && (
              <button
                key={tab.id}
                className={`tablink ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            )
        )}
      </div>

      <div className="tabcontent">{renderActiveTab()}</div>
    </div>
  );
}
