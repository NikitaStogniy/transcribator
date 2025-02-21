"use client";

import React from "react";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Button } from "@/shared/ui/Button";
import { useTranslations } from "next-intl";

export const HeroSection: React.FC = () => {
  const t = useTranslations("hero");

  return (
    <section className="bg-background py-16 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <ThemedText variant="h1" className="mb-4 text-primary">
          {t("title")}
        </ThemedText>

        <ThemedText variant="subtitle1" className="mb-8 text-secondary">
          {t("subtitle")}
        </ThemedText>

        <div>
          <Button
            variant="primary"
            size="large"
            className="hover:bg-primary-dark transition-colors duration-300"
          >
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
};
