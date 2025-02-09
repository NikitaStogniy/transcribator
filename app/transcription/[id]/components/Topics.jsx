export default function Topics({ categories }) {
  if (!categories?.results) {
    return <div>Категории не доступны</div>;
  }

  const topics = Object.entries(categories.results)
    .filter(([, value]) => value > 0.5)
    .sort(([, a], [, b]) => b - a);

  if (topics.length === 0) {
    return <div>Не найдено категорий с уверенностью выше 50%</div>;
  }

  return (
    <div className="topics">
      <h3>Категории IAB</h3>
      {topics.map(([category, confidence]) => (
        <div key={category} className="topic-item">
          <span className="topic-name">{category}</span>
          <div className="confidence-bar">
            <div
              className="confidence-level"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <span className="confidence-value">
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}
