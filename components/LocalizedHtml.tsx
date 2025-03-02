"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function LocalizedHtml() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    // Устанавливаем атрибут lang непосредственно в HTML элемент
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
