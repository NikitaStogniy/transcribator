export interface Segment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  confidence: number;
}

export interface Transcript {
  id: string;
  status: string;
  audioUrl: string;
  fileName: string;
  createdAt: string;
  language: string;
  duration: number;
  segments: Segment[];
  author?: {
    name: string;
    avatarUrl?: string;
  };
}
