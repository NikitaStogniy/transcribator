"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import ConfigFields from "../components/ConfigFields";

type ConfigInputs = {
  language_code: string;
  speaker_labels: boolean;
  speakers_expected: number;
  sentiment_analysis: boolean;
  iab_categories: boolean;
  entity_detection: boolean;
  speech_model: string;
  auto_highlights: boolean;
};

type FormInputs = {
  audio: FileList;
  config: ConfigInputs;
};

export default function HomePage() {
  const methods = useForm<FormInputs>({
    defaultValues: {
      config: {
        language_code: "ru",
        speaker_labels: true,
        speakers_expected: 4,
        sentiment_analysis: false,
        iab_categories: false,
        entity_detection: false,
        speech_model: "best",
        auto_highlights: false,
      },
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    const formData = new FormData();

    if (data.audio && data.audio.length > 0) {
      formData.append("audio", data.audio[0]);
    }
    // Сериализуем объект конфигурации в JSON‑строку
    formData.append("config", JSON.stringify(data.config));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const resData = await res.json();
      if (resData.link) {
        setLink(resData.link);
      }
    } catch (error) {
      console.error("Ошибка загрузки файла", error);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Сервис транскрибации</h1>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label>
              Выберите аудиофайл:
              <input
                type="file"
                accept="audio/*"
                {...register("audio", { required: "Аудиофайл обязателен" })}
              />
            </label>
            {errors.audio && <p>{errors.audio.message}</p>}
          </div>

          {/* Компонент для настроек транскрипции */}
          <ConfigFields />

          <button type="submit" disabled={loading}>
            {loading ? "Загрузка файла..." : "Продолжить"}
          </button>
        </form>
      </FormProvider>
      {link && (
        <p>
          Перейти к транскрипции: <a href={link}>{link}</a>
        </p>
      )}
    </div>
  );
}
