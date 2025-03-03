"use client";

import { useTranslations } from "next-intl";

export function CTASection() {
  const t = useTranslations("landing");

  return (
    <section className="py-24 px-4 md:px-6">
      <div className="container">
        <div className="relative rounded-3xl bg-gradient-to-b from-primary/10 via-primary/5 to-background border border-border p-8 md:p-12 lg:p-16 overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">{t("cta.title")}</h2>
            <p className="text-xl text-muted-foreground">
              {t("cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("cta.button")}
              </a>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
