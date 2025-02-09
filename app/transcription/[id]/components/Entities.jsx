export default function Entities({ entities }) {
  if (!entities?.length) {
    return <div>Сущности не обнаружены</div>;
  }

  return (
    <div className="entities">
      <h3>Обнаруженные сущности</h3>
      {entities.map((entity, index) => (
        <div key={index} className="entity-item">
          <span className="entity-text">"{entity.text}"</span>
          <span className="entity-type">{entity.entity_type}</span>
        </div>
      ))}
    </div>
  );
}
