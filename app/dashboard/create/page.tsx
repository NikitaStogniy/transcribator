"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import "@/styles/create.css";

export default function CreateTranscription() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("ru");
  const [speakers, setSpeakers] = useState(1);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    formData.append("participantsCount", speakers.toString());

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Некорректный ответ от сервера");
      }

      if (!response.ok) {
        throw new Error(
          data.details || data.error || "Ошибка при загрузке файла"
        );
      }

      if (data.transcriptionId) {
        router.push(`/transcription/${data.transcriptionId}`);
      } else {
        throw new Error("Не получен ID транскрибации");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при загрузке файла"
      );
      setIsUploading(false);
    }
  };

  return (
    <div className="create-page">
      <div className="create-sidebar">
        <h3 className="create-title">Новая транскрибация</h3>
        <p className="create-description">
          Загрузите аудио файл для создания транскрибации. Поддерживаемые
          форматы: MP3, WAV, M4A.
        </p>
      </div>

      <div className="create-form">
        <form onSubmit={handleSubmit}>
          <div className="form-container">
            <div className="form-content">
              <label className="file-upload-label">Аудио файл</label>
              <div className="file-upload-area">
                <div className="file-upload-content">
                  <Icon
                    path="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    size="lg"
                    className="file-upload-icon"
                  />
                  <div className="file-upload-text">
                    <label htmlFor="file-upload" className="file-upload-button">
                      Загрузить файл
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="audio/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <p>или перетащите сюда</p>
                  </div>
                  <p className="file-upload-hint">MP3, WAV, M4A до 500MB</p>
                </div>
              </div>
              {file && (
                <div className="selected-file">
                  <p>Выбран файл: {file.name}</p>
                </div>
              )}
              {error && (
                <div className="error-message">
                  <p className="text-red-500">{error}</p>
                </div>
              )}

              <div className="settings-section">
                <h4 className="settings-title">Настройки транскрибации</h4>
                <div className="settings-grid">
                  <div className="settings-field">
                    <label htmlFor="language" className="settings-label">
                      Язык аудио
                    </label>
                    <select
                      id="language"
                      className="settings-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                      <option value="uk">Українська</option>
                    </select>
                    <p className="settings-hint">
                      Выберите основной язык аудиозаписи
                    </p>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="speakers" className="settings-label">
                      Количество участников
                    </label>
                    <select
                      id="speakers"
                      className="settings-select"
                      value={speakers}
                      onChange={(e) => setSpeakers(parseInt(e.target.value))}
                    >
                      <option value={1}>1 участник</option>
                      <option value={2}>2 участника</option>
                      <option value={3}>3 участника</option>
                      <option value={4}>4 участника</option>
                      <option value={5}>5 участников</option>
                    </select>
                    <p className="settings-hint">
                      Укажите примерное количество говорящих
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-footer">
              <button
                type="submit"
                disabled={!file || isUploading}
                className={`submit-button ${
                  isUploading ? "submit-button-loading" : ""
                }`}
              >
                {isUploading ? "Загрузка..." : "Создать транскрибацию"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
