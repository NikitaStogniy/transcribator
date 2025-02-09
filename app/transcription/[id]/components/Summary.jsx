export default function Summary({ summary }) {
  if (!summary) {
    return <div>Краткое содержание недоступно</div>;
  }

  return (
    <div className="summary">
      <h3>Краткое содержание</h3>
      <div className="summary-content">{summary}</div>
    </div>
  );
}
