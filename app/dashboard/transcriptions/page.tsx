import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Icon from "@/components/Icon";
import "@/styles/transcriptions.css";
import type { Transcription } from "@/types/transcription";

export default async function Transcriptions() {
  const session = await getServerSession(authOptions);
  const transcriptions = (await prisma.transcription.findMany({
    where: {
      userId: session?.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as Transcription[];

  return (
    <div>
      <div className="transcriptions-header">
        <div className="header-content">
          <h1 className="header-title">Мои транскрибации</h1>
          <p className="header-description">
            Полный список всех ваших аудио транскрибаций
          </p>
        </div>
        <div className="header-actions">
          <Link href="/dashboard/create" className="create-button">
            Создать новую
          </Link>
        </div>
      </div>

      <div className="table-container">
        <div className="table-scroll">
          <div className="table-inner">
            {transcriptions.length === 0 ? (
              <div className="empty-state">
                <Icon
                  path="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  size="lg"
                  className="empty-icon"
                />
                <h3 className="empty-title">Нет транскрибаций</h3>
                <p className="empty-description">
                  Начните с создания новой транскрибации.
                </p>
                <div className="empty-action">
                  <Link href="/dashboard/create" className="create-button">
                    Создать новую
                  </Link>
                </div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Название файла</th>
                    <th className="table-header">Статус</th>
                    <th className="table-header">Дата создания</th>
                    <th className="table-header">Длительность</th>
                    <th className="table-header">
                      <span className="sr-only">Действия</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transcriptions.map((transcription) => (
                    <tr key={transcription.id} className="table-row">
                      <td className="table-cell">{transcription.fileName}</td>
                      <td className="table-cell">
                        <span
                          className={`status-badge ${
                            transcription.status === "completed"
                              ? "status-completed"
                              : transcription.status === "error"
                              ? "status-error"
                              : "status-processing"
                          }`}
                        >
                          {transcription.status === "completed"
                            ? "Завершено"
                            : transcription.status === "error"
                            ? "Ошибка"
                            : "В процессе"}
                        </span>
                      </td>
                      <td className="table-cell">
                        {new Date(transcription.createdAt).toLocaleDateString(
                          "ru-RU",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className="table-cell">
                        {transcription.durationSeconds
                          ? `${Math.floor(
                              transcription.durationSeconds / 60
                            )}:${String(
                              transcription.durationSeconds % 60
                            ).padStart(2, "0")}`
                          : "-"}
                      </td>
                      <td className="table-cell">
                        <Link
                          href={`/transcription/${transcription.id}`}
                          className="action-button"
                        >
                          Просмотр
                          <span className="sr-only">
                            , {transcription.fileName}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
