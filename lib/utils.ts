import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
  LevelFormat,
  TabStopPosition,
  TabStopType,
} from "docx";

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  }
  return `${minutes}:${padZero(remainingSeconds)}`;
}

function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}

export function formatTimeForSRT(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)},${padZero(
    ms
  ).slice(0, 3)}`;
}

export function generateSRT(
  segments: Array<{
    text: string;
    startTime: number;
    endTime: number;
    speaker?: string | null;
  }>
): string {
  return segments
    .map((segment, index) => {
      const text = segment.speaker
        ? `[${segment.speaker}] ${segment.text}`
        : segment.text;

      return `${index + 1}
${formatTimeForSRT(segment.startTime)} --> ${formatTimeForSRT(segment.endTime)}
${text}
`;
    })
    .join("\n");
}

export function searchInSegments(
  segments: Array<{ text: string; startTime: number }>,
  query: string
): Array<{ segmentIndex: number; startTime: number; text: string }> {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return segments
    .map((segment, index) => ({
      segmentIndex: index,
      startTime: segment.startTime,
      text: segment.text,
      matchIndex: segment.text.toLowerCase().indexOf(normalizedQuery),
    }))
    .filter((result) => result.matchIndex !== -1)
    .map(({ segmentIndex, startTime, text }) => ({
      segmentIndex,
      startTime,
      text,
    }));
}

export async function generateDOCX(
  segments: Array<{
    text: string;
    startTime: number;
    endTime: number;
    speaker?: string | null;
  }>,
  title: string = "Transcription"
): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),
          ...segments.map(
            (segment) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[${formatTime(segment.startTime)}] `,
                    bold: true,
                    color: "666666",
                  }),
                  ...(segment.speaker
                    ? [
                        new TextRun({
                          text: `${segment.speaker}: `,
                          bold: true,
                          color: "2563eb",
                        }),
                      ]
                    : []),
                  new TextRun({
                    text: segment.text,
                  }),
                ],
                spacing: {
                  after: 200,
                },
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
              })
          ),
        ],
      },
    ],
  });

  const buffer = await doc.save();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
