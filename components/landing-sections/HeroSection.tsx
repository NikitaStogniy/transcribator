"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export function HeroSection() {
  const t = useTranslations("landing");

  return (
    <section className="min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/50">
      <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter">
            {t("hero.title")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-[600px]">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              href="#get-started"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("hero.cta")}
            </a>
          </div>
        </div>
        <div className="flex-1 min-h-[400px] w-full relative rounded-lg border border-border bg-card">
          {/* Placeholder for hero image/animation */}
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            [Hero Image Placeholder]
          </div>
        </div>
      </div>
    </section>
  );
}
