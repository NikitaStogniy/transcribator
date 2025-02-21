import React from "react";
import { ThemedText } from "@/shared/ui/ThemedText";

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 px-4">
      <ThemedText variant="h2" className="text-center mb-8">
        Возможности Transcribator
      </ThemedText>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Placeholder features */}
        <div>
          <ThemedText variant="h3">Точность</ThemedText>
          <ThemedText variant="body1">Высокоточная транскрипция</ThemedText>
        </div>
        <div>
          <ThemedText variant="h3">Скорость</ThemedText>
          <ThemedText variant="body1">Быстрая обработка аудио</ThemedText>
        </div>
        <div>
          <ThemedText variant="h3">Многоязычность</ThemedText>
          <ThemedText variant="body1">Поддержка нескольких языков</ThemedText>
        </div>
      </div>
    </section>
  );
};
