"use client";

import { ThemedText } from "@/shared/ui/ThemedText";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <ThemedText variant="h3" className="text-white mb-4">
            Transcribator
          </ThemedText>
          <ThemedText variant="body1" className="text-gray-300">
            Точная и быстрая транскрипция аудио
          </ThemedText>
        </div>
        <div>
          <ThemedText variant="subtitle1" className="text-white mb-4">
            Контакты
          </ThemedText>
          <ThemedText variant="body1" className="text-gray-300">
            Email: support@transcribator.com
          </ThemedText>
        </div>
        <div>
          <ThemedText variant="subtitle1" className="text-white mb-4">
            Социальные сети
          </ThemedText>
          <div className="flex space-x-4">
            {["Telegram", "GitHub", "LinkedIn"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-gray-300 hover:text-white"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center mt-8">
        <ThemedText variant="caption" className="text-gray-500">
          © {new Date().getFullYear()} Transcribator. Все права защищены.
        </ThemedText>
      </div>
    </footer>
  );
};
