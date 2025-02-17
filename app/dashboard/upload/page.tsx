"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TranscriptionUploadForm from "@/components/TranscriptionUploadForm";

export default function UploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (formData: FormData) => {
    setIsUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        router.push(`/transcription/${data.id}`);
      } else {
        throw new Error(data.error || "Ошибка при загрузке файла");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert(
        "Произошла ошибка при загрузке файла. Пожалуйста, попробуйте снова."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Загрузить новую транскрипцию</h1>
      <TranscriptionUploadForm
        onUpload={handleUpload}
        isUploading={isUploading}
      />
    </div>
  );
}
