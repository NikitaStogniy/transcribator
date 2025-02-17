# Структура базы данных Transcribator

## Аутентификация и пользователи

### User

Основная модель пользователя

- `id` (String) - Уникальный идентификатор
- `name` (String?) - Имя пользователя
- `email` (String?) - Email пользователя (уникальный)
- `emailVerified` (DateTime?) - Дата верификации email
- `image` (String?) - URL аватара пользователя
- `minutesBalance` (Int) - Баланс доступных минут
- `minutesUsed` (Int) - Количество использованных минут
- Связи:
  - `accounts` - Связанные аккаунты для OAuth
  - `sessions` - Сессии пользователя
  - `transcriptions` - Транскрибации пользователя

### Account

Модель для OAuth аутентификации

- `id` (String) - Уникальный идентификатор
- `userId` (String) - ID пользователя
- `type` (String) - Тип аккаунта
- `provider` (String) - Провайдер (Google, Email)
- `providerAccountId` (String) - ID аккаунта у провайдера
- `refresh_token` (String?) - Токен обновления
- `access_token` (String?) - Токен доступа
- `expires_at` (Int?) - Время истечения токена
- `token_type` (String?) - Тип токена
- `scope` (String?) - Scope токена
- `id_token` (String?) - ID токена
- `session_state` (String?) - Состояние сессии
- Связи:
  - `user` - Связанный пользователь

### Session

Модель сессий пользователя

- `id` (String) - Уникальный идентификатор
- `sessionToken` (String) - Токен сессии (уникальный)
- `userId` (String) - ID пользователя
- `expires` (DateTime) - Время истечения сессии
- Связи:
  - `user` - Связанный пользователь

### VerificationToken

Модель для верификации email

- `identifier` (String) - Идентификатор (email)
- `token` (String) - Токен верификации (уникальный)
- `expires` (DateTime) - Время истечения токена

## Транскрибация

### Transcription

Основная модель транскрибации

- `id` (String) - Уникальный идентификатор
- `createdAt` (DateTime) - Дата создания
- `updatedAt` (DateTime) - Дата обновления
- `fileName` (String) - Имя файла
- `fileUrl` (String) - URL файла
- `status` (String) - Статус транскрибации (pending, processing, completed, error)
- `transcriptText` (String?) - Текст транскрибации
- `summary` (String?) - Краткое содержание
- `userId` (String) - ID пользователя
- `durationSeconds` (Int?) - Длительность в секундах
- `fileSize` (Int?) - Размер файла в байтах
- `language` (String?) - Язык аудио
- Связи:
  - `user` - Владелец транскрибации
  - `topics` - Темы транскрибации
  - `entities` - Сущности в тексте
  - `questions` - Вопросы и ответы
  - `sentiment` - Анализ тональности

### Topic

Модель для тем транскрибации

- `id` (String) - Уникальный идентификатор
- `text` (String) - Текст темы
- `transcriptionId` (String) - ID транскрибации
- Связи:
  - `transcription` - Связанная транскрибация

### Entity

Модель для именованных сущностей

- `id` (String) - Уникальный идентификатор
- `text` (String) - Текст сущности
- `type` (String) - Тип сущности
- `transcriptionId` (String) - ID транскрибации
- Связи:
  - `transcription` - Связанная транскрибация

### Question

Модель для вопросов и ответов

- `id` (String) - Уникальный идентификатор
- `question` (String) - Текст вопроса
- `answer` (String) - Текст ответа
- `transcriptionId` (String) - ID транскрибации
- Связи:
  - `transcription` - Связанная транскрибация

### SentimentAnalysis

Модель для анализа тональности

- `id` (String) - Уникальный идентификатор
- `sentiment` (String) - Тональность текста
- `confidence` (Float) - Уверенность в оценке
- `transcriptionId` (String) - ID транскрибации (уникальный)
- Связи:
  - `transcription` - Связанная транскрибация

## Индексы и ограничения

### Уникальные индексы

- `User.email`
- `Session.sessionToken`
- `VerificationToken.token`
- `Account.[provider, providerAccountId]`
- `SentimentAnalysis.transcriptionId`

### Каскадное удаление

- При удалении `User` каскадно удаляются:
  - `Account`
  - `Session`
  - `Transcription` (и связанные с ней записи)

## Значения по умолчанию

- `User.minutesBalance` = 0
- `User.minutesUsed` = 0
- `Transcription.status` = "pending"

## Новая модель для транзакций

model Transaction {
id String @id @default(cuid())
createdAt DateTime @default(now())
amount Int // Количество минут
price Float // Стоимость в рублях
status String // success, pending, failed
userId String
user User @relation(fields: [userId], references: [id])
}
