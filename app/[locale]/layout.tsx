import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/routing";
import LocalizedHtml from "@/components/LocalizedHtml";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Enable static rendering
  // setRequestLocale(locale);  // Временно отключаем до решения проблемы

  // Load messages for the current locale
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocalizedHtml />
      {children}
    </NextIntlClientProvider>
  );
}
