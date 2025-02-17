import { useState, useRef } from "react";
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/lib/transcriptions";
import "@/styles/TranscriptionUploadForm.css";

interface TranscriptionUploadFormProps {
  onUpload: (formData: FormData) => Promise<void>;
  isUploading: boolean;
}

export default function TranscriptionUploadForm({
  onUpload,
  isUploading,
}: TranscriptionUploadFormProps) {
  const [language, setLanguage] = useState<SupportedLanguage>("ru");
  const [participantsCount, setParticipantsCount] = useState<number>(1);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("language", language);
    formData.append("participantsCount", participantsCount.toString());

    await onUpload(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <div className="form-group">
        <div className="form-field">
          <label htmlFor="language" className="form-label">
            Язык аудио
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="form-select"
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="participants" className="form-label">
            Количество участников
          </label>
          <input
            type="number"
            id="participants"
            min="1"
            max="10"
            value={participantsCount}
            onChange={(e) =>
              setParticipantsCount(
                Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
              )
            }
            className="form-input"
          />
        </div>

        <div
          className={`upload-zone ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="upload-text">
            <div>
              {selectedFile ? (
                <div>Выбран файл: {selectedFile.name}</div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-button"
                >
                  Выберите аудио файл
                </button>
              )}
            </div>
            <p className="upload-hint">или перетащите его сюда</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!selectedFile || isUploading}
        className="submit-button"
      >
        {isUploading ? "Загрузка..." : "Загрузить"}
      </button>
    </form>
  );
}
