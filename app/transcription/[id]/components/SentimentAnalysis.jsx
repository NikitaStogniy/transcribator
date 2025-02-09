export default function SentimentAnalysis({ results }) {
  if (!results?.length) {
    return <div>Анализ тональности не доступен</div>;
  }

  return (
    <div className="sentiment-analysis">
      <h3>Анализ тональности</h3>
      {results.map((result, index) => (
        <div
          key={index}
          className={`sentiment ${result.sentiment.toLowerCase()}`}
        >
          <p>"{result.text}"</p>
          <span className="sentiment-label">{result.sentiment}</span>
        </div>
      ))}
    </div>
  );
}
