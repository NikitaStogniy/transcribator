import React from "react";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Button } from "@/shared/ui/Button";

export const CTASection: React.FC = () => {
  return (
    <section className="bg-secondary text-white py-16 text-center">
      <ThemedText variant="h2" className="mb-4 text-white">
        Начните транскрибацию прямо сейчас
      </ThemedText>
      <ThemedText variant="subtitle1" className="mb-8 text-white">
        Попробуйте бесплатно и убедитесь в качестве
      </ThemedText>
      <Button variant="primary" size="large">
        Бесплатная демо-версия
      </Button>
    </section>
  );
};
