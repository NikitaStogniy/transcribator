import { useFormContext } from "react-hook-form";
import SwitchInput from "./SwitchInput";

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

export default function ConfigFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<{ config: ConfigInputs }>();

  return (
    <div className="config-fields">
      <h2>Конфигурация транскрипции</h2>

      <div className="field">
        <label>
          Код языка:
          <input
            type="text"
            {...register("config.language_code", {
              required: "Код языка обязателен",
            })}
          />
        </label>
        {errors.config?.language_code && (
          <p>{errors.config.language_code.message}</p>
        )}
      </div>

      <SwitchInput
        label="Метки говорящих"
        register={register("config.speaker_labels")}
      />

      <div className="field">
        <label>
          Ожидаемое количество спикеров:
          <input
            type="number"
            {...register("config.speakers_expected", {
              required: "Обязательное поле",
              valueAsNumber: true,
            })}
          />
        </label>
        {errors.config?.speakers_expected && (
          <p>{errors.config.speakers_expected.message}</p>
        )}
      </div>

      <SwitchInput
        label="Анализ тональности"
        register={register("config.sentiment_analysis")}
      />

      <SwitchInput
        label="Категории IAB"
        register={register("config.iab_categories")}
      />

      <SwitchInput
        label="Обнаружение сущностей"
        register={register("config.entity_detection")}
      />

      <div className="field">
        <label>
          Модель речи:
          <input
            type="text"
            {...register("config.speech_model", {
              required: "Модель речи обязательна",
            })}
          />
        </label>
        {errors.config?.speech_model && (
          <p>{errors.config.speech_model.message}</p>
        )}
      </div>

      <SwitchInput
        label="Автоматическое выделение"
        register={register("config.auto_highlights")}
      />
    </div>
  );
}
