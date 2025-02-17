"use client";

import React from "react";
import "./SpeakersList.css";

interface SpeakersListProps {
  transcriptionId: string;
}

interface Speaker {
  id: string;
  name: string;
  color: string;
}

const SpeakersList: React.FC<SpeakersListProps> = ({ transcriptionId }) => {
  const [speakers, setSpeakers] = React.useState<Speaker[]>([
    { id: "C0", name: "Спикер 01", color: "#F87171" },
    { id: "C1", name: "Спикер 02", color: "#60A5FA" },
    { id: "C2", name: "Спикер 03", color: "#34D399" },
  ]);
  const [editingSpeakerId, setEditingSpeakerId] = React.useState<string | null>(
    null
  );
  const [editingName, setEditingName] = React.useState("");

  const handleEditClick = (speaker: Speaker) => {
    setEditingSpeakerId(speaker.id);
    setEditingName(speaker.name);
  };

  const handleSaveClick = async (speakerId: string) => {
    // TODO: Implement API call to update speaker name
    setSpeakers(
      speakers.map((s) =>
        s.id === speakerId ? { ...s, name: editingName } : s
      )
    );
    setEditingSpeakerId(null);
  };

  const handleDeleteClick = async (speakerId: string) => {
    // TODO: Implement API call to delete speaker
    setSpeakers(speakers.filter((s) => s.id !== speakerId));
  };

  const handleAddSpeaker = () => {
    const newId = `C${speakers.length}`;
    const colors = ["#F87171", "#60A5FA", "#34D399", "#A78BFA", "#FBBF24"];
    const newSpeaker = {
      id: newId,
      name: `Спикер ${(speakers.length + 1).toString().padStart(2, "0")}`,
      color: colors[speakers.length % colors.length],
    };
    setSpeakers([...speakers, newSpeaker]);
  };

  return (
    <div className="speakers-list">
      <div className="speakers-header">
        <h2>Спикеры ({speakers.length})</h2>
        <button onClick={handleAddSpeaker} className="add-speaker-button">
          Добавить спикера
        </button>
      </div>

      <div className="speakers-grid">
        {speakers.map((speaker) => (
          <div key={speaker.id} className="speaker-item">
            <div
              className="speaker-avatar"
              style={{ backgroundColor: speaker.color }}
            >
              {speaker.name.charAt(0)}
            </div>
            <div className="speaker-info">
              {editingSpeakerId === speaker.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleSaveClick(speaker.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSaveClick(speaker.id)
                  }
                  className="speaker-name-input"
                  autoFocus
                />
              ) : (
                <span className="speaker-name">{speaker.name}</span>
              )}
              <div className="speaker-actions">
                <button
                  onClick={() => handleEditClick(speaker)}
                  className="action-button"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteClick(speaker.id)}
                  className="action-button"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeakersList;
