"use client";

import { useTranslations } from "next-intl";

export function FeaturesSection() {
  const t = useTranslations("landing");

  const features = [1, 2, 3, 4, 5].map((i) => ({
    title: t(`features.card${i}.title`),
    description: t(`features.card${i}.description`),
  }));

  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          {t("features.title")}
        </h2>
        <div className="grid gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-lg text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              <div className="relative aspect-video rounded-lg border border-border bg-card">
                {/* Placeholder for feature image */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  [Feature {index + 1} Image Placeholder]
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
