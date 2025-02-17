import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Transcription } from "@/types/transcription";
import Icon from "@/components/Icon";
import "@/styles/dashboard.css";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const transcriptions = (await prisma.transcription.findMany({
    where: {
      userId: session?.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })) as Transcription[];

  const stats = await prisma.$transaction([
    prisma.transcription.count({
      where: { userId: session?.user.id },
    }),
    prisma.transcription.count({
      where: {
        userId: session?.user.id,
        status: "completed",
      },
    }),
    prisma.transcription.count({
      where: {
        userId: session?.user.id,
        status: "processing",
      },
    }),
  ]);

  const [total, completed, processing] = stats;

  return (
    <div>
      {/* Статистика */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon-wrapper">
              <Icon
                path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                size="md"
                className="stat-icon"
              />
              <div className="stat-info">
                <dt className="stat-label">Всего транскрибаций</dt>
                <dd className="stat-value">{total}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon-wrapper">
              <Icon path="M5 13l4 4L19 7" size="md" className="stat-icon" />
              <div className="stat-info">
                <dt className="stat-label">Завершено</dt>
                <dd className="stat-value">{completed}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon-wrapper">
              <Icon
                path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                size="md"
                className="stat-icon"
              />
              <div className="stat-info">
                <dt className="stat-label">В процессе</dt>
                <dd className="stat-value">{processing}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Последние транскрибации */}
      <div className="recent-transcriptions">
        <div className="section-header">
          <h3 className="section-title">Последние транскрибации</h3>
        </div>

        {transcriptions.length === 0 ? (
          <div className="empty-state">
            <p className="empty-message">У вас пока нет транскрибаций</p>
            <div className="create-first">
              <Link href="/dashboard/create" className="create-button">
                Создать первую транскрибацию
              </Link>
            </div>
          </div>
        ) : (
          <div className="transcription-list">
            {transcriptions.map((transcription) => (
              <div key={transcription.id} className="transcription-item">
                <div className="transcription-header">
                  <div className="transcription-info">
                    <Icon
                      path="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      size="md"
                      className="transcription-icon"
                    />
                    <div className="transcription-details">
                      <h4 className="transcription-name">
                        {transcription.fileName}
                      </h4>
                      <p className="transcription-date">
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
                      </p>
                    </div>
                  </div>
                  <div className="transcription-actions">
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
                    <Link
                      href={`/transcription/${transcription.id}`}
                      className="view-button"
                    >
                      Просмотр
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            <div className="view-all">
              <Link href="/dashboard/transcriptions" className="view-all-link">
                Посмотреть все транскрибации →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Быстрые действия */}
      <div className="quick-actions">
        <div className="section-header">
          <h3 className="section-title">Быстрые действия</h3>
        </div>
        <div className="section-content">
          <Link href="/dashboard/create" className="create-button">
            Создать новую транскрибацию
          </Link>
        </div>
      </div>
    </div>
  );
}
