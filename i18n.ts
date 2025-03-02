import { getRequestConfig } from "next-intl/server";
import { routing } from "./i18n/routing";

// This is the default locale configuration
export const locales = ["en", "ru"];
export const defaultLocale = "en";

// This function can be used to get the locale from the request or other sources
export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load the messages for the locale
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
