"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "../navigation";

export default function LanguageSwitcher({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const locale = useLocale();

  // Determine the target locale (toggle between en and ru)
  const targetLocale = locale === "en" ? "ru" : "en";

  return (
    <Link href={pathname} locale={targetLocale}>
      {children}
    </Link>
  );
}
