// Repositórios de Domínio — Simulify
// Conforme especificado em BACKEND.md (Seção 6) e ARCHITECTURE.md (Seção 5)
// Essa camada isola a interface gráfica do mecanismo de banco.

import { Simulado, Question, ExamResult } from '../types';

export interface StudyGoalData {
  daysOfWeek: number[]; // 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb, 0 = Dom
  targetPerDay: number;
  weeklyTarget: number;
  streakDays: number;
}

export interface ISimulationRepository {
  findAll(): Promise<Simulado[]>;
  findById(id: string): Promise<Simulado | null>;
  save(simulation: Simulado): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IQuestionBankRepository {
  getAllQuestions(): Promise<Question[]>;
  saveQuestion(question: Question): Promise<void>;
  updateQuestion(id: string, data: Partial<Question>): Promise<void>;
  deleteQuestion(id: string): Promise<void>;
  getSubjects(): Promise<{ subject: string; count: number }[]>;
  generateRandom(subject: string | 'all', count: number): Promise<Simulado>;
}

export interface IResultRepository {
  getAllResults(): Promise<ExamResult[]>;
  findById(id: string): Promise<ExamResult | null>;
  saveResult(result: ExamResult): Promise<void>;
}

export interface IGoalRepository {
  getGoal(): Promise<StudyGoalData>;
  updateGoal(goal: Partial<StudyGoalData>): Promise<void>;
}
