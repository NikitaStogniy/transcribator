"use client";

import { useState } from "react";

export default function HomePage() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    setLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.link) {
        setLink(data.link);
        // Для автоматического перехода можно использовать router.push(data.link);
      }
    } catch (error) {
      console.error("Ошибка загрузки файла", error);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Сервис транскрибации</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" name="audio" accept="audio/*" required />
        <button type="submit">Загрузить аудиофайл</button>
      </form>
      {loading && <p>Загрузка файла...</p>}
      {link && (
        <p>
          Перейти к транскрипции: <a href={link}>{link}</a>
        </p>
      )}
    </div>
  );
}
