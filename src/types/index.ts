export interface Question {
  id?: string;
  question: string;
  options: string[];
  correct: number; // 0-indexed
  explanation?: string;
  subject?: string;
  difficulty?: number | string; // e.g. 1 (fácil), 2 (médio), 3 (difícil)
}

export interface Simulado {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
  isPreset?: boolean;
  tags?: string[];
  timeLimitMinutes?: number;
}

export interface ExamAnswerRecord {
  selectedOption: number | null; // null if blank
  eliminatedOptions: number[]; // indices of options crossed out
  markedForReview: boolean;
  timeSpentSeconds: number;
}

export interface ActiveExamSession {
  simuladoId: string;
  simuladoTitle: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, ExamAnswerRecord>;
  startedAt: string;
  elapsedSeconds: number;
  isPaused: boolean;
}

export interface ExamResult {
  id: string;
  simuladoId: string;
  simuladoTitle: string;
  completedAt: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  totalTimeSeconds: number;
  answers: Record<number, {
    selectedOption: number | null;
    isCorrect: boolean;
    correctOption: number;
    explanation?: string;
  }>;
  questions: Question[];
  subjectBreakdown: Record<string, { total: number; correct: number }>;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type StudyFocus = 'enem' | 'concurso' | 'geral';
export type GoalMetric = 'questions' | 'exam_time';

export interface StudyPreferences {
  focus: StudyFocus;
  goalMetric: GoalMetric;
  weeklyTarget: number;
}

export interface WeeklyStudyGoal {
  activeDays: number[]; // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb
  questionsPerStudyDay: number;
}
