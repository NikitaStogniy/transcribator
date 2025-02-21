"use client";

import { ThemedText } from "@/shared/ui/ThemedText";

export const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-gray-100">
      <ThemedText variant="h2" className="text-center mb-8">
        Отзывы пользователей
      </ThemedText>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            name: "Анна К.",
            text: "Невероятно удобный сервис для транскрипции интервью",
          },
          {
            name: "Михаил П.",
            text: "Точность распознавания просто поражает!",
          },
          {
            name: "Елена С.",
            text: "Экономит массу времени при работе с аудиоматериалами",
          },
        ].map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md text-center"
          >
            <ThemedText variant="body1" className="mb-4">
              "{testimonial.text}"
            </ThemedText>
            <ThemedText variant="subtitle1" className="font-semibold">
              {testimonial.name}
            </ThemedText>
          </div>
        ))}
      </div>
    </section>
  );
};
