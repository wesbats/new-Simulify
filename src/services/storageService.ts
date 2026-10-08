import { Simulado, ExamResult, ActiveExamSession, Question, WeeklyStudyGoal, StudyPreferences } from '../types';
import { DEFAULT_SIMULADOS } from '../data/defaultSimulados';
import { deletePersisted, readPersisted, writePersisted } from './indexedDbService';

const STORAGE_KEYS = {
  CUSTOM_SIMULADOS: 'simulify_custom_simulados_v1',
  EXAM_RESULTS: 'simulify_exam_results_v1',
  ACTIVE_SESSION: 'simulify_active_session_v1',
  QUESTION_BANK: 'simulify_question_bank_v1',
  DAILY_GOAL: 'simulify_daily_goal_v1',
  WEEKLY_GOAL: 'simulify_weekly_goal_v2',
};

function persist(key: string, value: string): void {
  writePersisted(key, value);
}

function removePersisted(key: string): void {
  deletePersisted(key);
}

function seedInitialQuestionBank(): Question[] {
  const bank: Question[] = [];
  const seen = new Set<string>();

  DEFAULT_SIMULADOS.forEach((s) => {
    s.questions.forEach((q, idx) => {
      const qId = q.id || `${s.id}-q-${idx + 1}`;
      if (!seen.has(q.question)) {
        seen.add(q.question);
        bank.push({
          ...q,
          id: qId,
          subject: q.subject || s.title,
        });
      }
    });
  });

  return bank;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const storageService = {
  // --- SIMULADOS ---
  getSimulados(): Simulado[] {
    try {
      const stored = readPersisted(STORAGE_KEYS.CUSTOM_SIMULADOS);
      const custom: Simulado[] = stored ? JSON.parse(stored) : [];
      return [...DEFAULT_SIMULADOS, ...custom];
    } catch (e) {
      console.error('Erro ao carregar simulados:', e);
      return [...DEFAULT_SIMULADOS];
    }
  },

  getSimuladoById(id: string): Simulado | undefined {
    const all = this.getSimulados();
    return all.find((s) => s.id === id);
  },

  saveCustomSimulado(simulado: Simulado): void {
    try {
      const stored = readPersisted(STORAGE_KEYS.CUSTOM_SIMULADOS);
      const custom: Simulado[] = stored ? JSON.parse(stored) : [];
      
      const existingIndex = custom.findIndex((s) => s.id === simulado.id);
      if (existingIndex >= 0) {
        custom[existingIndex] = simulado;
      } else {
        custom.unshift(simulado);
      }

      persist(STORAGE_KEYS.CUSTOM_SIMULADOS, JSON.stringify(custom));

      // Auto-sync questions into the Question Bank
      simulado.questions.forEach((q) => {
        this.saveQuestionToBank({
          ...q,
          id: q.id || `bank-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          subject: q.subject || simulado.title,
        });
      });
    } catch (e) {
      console.error('Erro ao salvar simulado no localStorage:', e);
    }
  },

  deleteCustomSimulado(id: string): void {
    try {
      const stored = readPersisted(STORAGE_KEYS.CUSTOM_SIMULADOS);
      if (!stored) return;
      const custom: Simulado[] = JSON.parse(stored);
      const filtered = custom.filter((s) => s.id !== id);
      persist(STORAGE_KEYS.CUSTOM_SIMULADOS, JSON.stringify(filtered));
    } catch (e) {
      console.error('Erro ao deletar simulado:', e);
    }
  },

  // --- BANCO DE QUESTÕES POR MATÉRIA ---
  getQuestionBank(): Question[] {
    try {
      const stored = readPersisted(STORAGE_KEYS.QUESTION_BANK);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Initialize with default seeds
      const initial = seedInitialQuestionBank();
      persist(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.error('Erro ao ler banco de questões:', e);
      return seedInitialQuestionBank();
    }
  },

  saveQuestionToBank(question: Question): void {
    try {
      const bank = this.getQuestionBank();
      const existingIndex = bank.findIndex((q) => q.id === question.id || q.question.trim() === question.question.trim());

      if (existingIndex >= 0) {
        bank[existingIndex] = { ...bank[existingIndex], ...question };
      } else {
        const withId = {
          ...question,
          id: question.id || `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        };
        bank.unshift(withId);
      }

      persist(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(bank));
    } catch (e) {
      console.error('Erro ao salvar questão no banco:', e);
    }
  },

  updateQuestionInBank(id: string, updated: Partial<Question>): void {
    try {
      const bank = this.getQuestionBank();
      const index = bank.findIndex((q) => q.id === id);
      if (index >= 0) {
        bank[index] = { ...bank[index], ...updated };
        persist(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(bank));
      }
    } catch (e) {
      console.error('Erro ao atualizar questão no banco:', e);
    }
  },

  deleteQuestionFromBank(id: string): void {
    try {
      const bank = this.getQuestionBank();
      const filtered = bank.filter((q) => q.id !== id);
      persist(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(filtered));
    } catch (e) {
      console.error('Erro ao remover questão do banco:', e);
    }
  },

  getSubjectsList(): { subject: string; count: number }[] {
    const bank = this.getQuestionBank();
    const map: Record<string, number> = {};

    bank.forEach((q) => {
      const sub = (q.subject || 'Conhecimentos Gerais').trim();
      map[sub] = (map[sub] || 0) + 1;
    });

    return Object.entries(map).map(([subject, count]) => ({ subject, count }));
  },

  generateRandomSimulado(subjectFilter: string | 'all', count: number, customTitle?: string): Simulado {
    const bank = this.getQuestionBank();
    let pool = bank;

    if (subjectFilter !== 'all') {
      pool = bank.filter((q) => (q.subject || '').toLowerCase() === subjectFilter.toLowerCase());
      if (pool.length === 0) pool = bank;
    }

    const shuffled = shuffleArray(pool);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    const title = customTitle || (
      subjectFilter === 'all'
        ? `Simulado Geral Aleatório (${selected.length}Q)`
        : `Simulado Rápido: ${subjectFilter} (${selected.length}Q)`
    );

    const newSimulado: Simulado = {
      id: `random-simulado-${Date.now()}`,
      title,
      description: `Simulado gerado aleatoriamente a partir do banco de questões (${selected.length} questões).`,
      questions: selected.map((q, idx) => ({
        ...q,
        id: `q-rand-${idx + 1}-${Date.now()}`,
      })),
      createdAt: new Date().toISOString(),
      tags: ['Sorteio Aleatório', subjectFilter === 'all' ? 'Misto' : subjectFilter],
      timeLimitMinutes: Math.max(5, selected.length * 3),
    };

    this.saveCustomSimulado(newSimulado);
    return newSimulado;
  },

  // --- RESULTADOS & HISTÓRICO ---
  getExamResults(): ExamResult[] {
    try {
      const stored = readPersisted(STORAGE_KEYS.EXAM_RESULTS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Erro ao buscar resultados:', e);
      return [];
    }
  },

  getExamResultById(id: string): ExamResult | undefined {
    const results = this.getExamResults();
    return results.find((r) => r.id === id);
  },

  saveExamResult(result: ExamResult): void {
    try {
      const results = this.getExamResults();
      results.unshift(result);
      persist(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(results));
      this.clearActiveExamSession();
    } catch (e) {
      console.error('Erro ao salvar resultado:', e);
    }
  },

  // --- SESSÃO ATIVA (AUTO-SAVE) ---
  getActiveExamSession(): ActiveExamSession | null {
    try {
      const stored = readPersisted(STORAGE_KEYS.ACTIVE_SESSION);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Erro ao ler sessão ativa:', e);
      return null;
    }
  },

  saveActiveExamSession(session: ActiveExamSession): void {
    try {
      persist(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    } catch (e) {
      console.error('Erro ao persistir sessão ativa:', e);
    }
  },

  clearActiveExamSession(): void {
    try {
      removePersisted(STORAGE_KEYS.ACTIVE_SESSION);
    } catch (e) {
      console.error('Erro ao limpar sessão ativa:', e);
    }
  },

  // --- META DIÁRIA (BENCHMARK DUOLINGO / QUIZLET) ---
  getDailyGoal(): { target: number; completedToday: number; streakDays: number; lastDate: string } {
    try {
      const stored = readPersisted(STORAGE_KEYS.DAILY_GOAL);
      const todayStr = new Date().toISOString().split('T')[0];

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lastDate !== todayStr) {
          // New day: compute questions completed today from ExamResults
          const results = this.getExamResults();
          const todayCount = results
            .filter((r) => r.completedAt.startsWith(todayStr))
            .reduce((acc, r) => acc + Object.values(r.answers).filter((answer) => answer.selectedOption !== null).length, 0);

          const updated = {
            target: parsed.target || 15,
            completedToday: todayCount,
            streakDays: todayCount >= (parsed.target || 15) ? parsed.streakDays + 1 : parsed.streakDays,
            lastDate: todayStr,
          };
          persist(STORAGE_KEYS.DAILY_GOAL, JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }

      // Initial default goal
      const initial = {
        target: 15,
        completedToday: 0,
        streakDays: 1,
        lastDate: todayStr,
      };
      persist(STORAGE_KEYS.DAILY_GOAL, JSON.stringify(initial));
      return initial;
    } catch (e) {
      return { target: 15, completedToday: 0, streakDays: 1, lastDate: new Date().toISOString().split('T')[0] };
    }
  },

  updateDailyGoalTarget(newTarget: number): void {
    try {
      const current = this.getDailyGoal();
      current.target = newTarget;
      persist(STORAGE_KEYS.DAILY_GOAL, JSON.stringify(current));
    } catch (e) {}
  },

  // --- PARSER E VALIDADOR SEGURO DE JSON ---
  parseAndValidateSimuladoJSON(rawJson: string): { success: boolean; data?: Simulado; error?: string } {
    try {
      const clean = rawJson.trim();
      if (!clean) {
        return { success: false, error: 'O JSON fornecido está vazio.' };
      }

      const parsed = JSON.parse(clean);

      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'O conteúdo deve ser um objeto JSON válido { "title": "...", "questions": [...] }.' };
      }

      if (!parsed.title || typeof parsed.title !== 'string' || !parsed.title.trim()) {
        return { success: false, error: 'O campo obrigatório "title" está ausente ou não é um texto.' };
      }

      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        return { success: false, error: 'O campo "questions" deve ser uma lista com pelo menos uma questão.' };
      }

      const validatedQuestions: Question[] = [];

      for (let i = 0; i < parsed.questions.length; i++) {
        const q = parsed.questions[i];
        if (!q.question || typeof q.question !== 'string') {
          return { success: false, error: `Questão #${i + 1} inválida: o enunciado "question" é obrigatório.` };
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          return { success: false, error: `Questão #${i + 1} inválida: "options" deve ter no mínimo 2 alternativas.` };
        }
        if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= q.options.length) {
          return {
            success: false,
            error: `Questão #${i + 1} inválida: "correct" deve ser o índice numérico (0 a ${q.options.length - 1}) da alternativa correta.`
          };
        }

        validatedQuestions.push({
          id: `q-${i + 1}-${Date.now()}`,
          question: q.question.trim(),
          options: q.options.map((opt: unknown) => String(opt).trim()),
          correct: q.correct,
          explanation: q.explanation ? String(q.explanation).trim() : 'Sem explicação detalhada.',
          subject: q.subject ? String(q.subject).trim() : parsed.title,
          difficulty: q.difficulty || 1,
        });
      }

      const newSimulado: Simulado = {
        id: `simulado-custom-${Date.now()}`,
        title: parsed.title.trim(),
        description: parsed.description ? String(parsed.description).trim() : `Simulado com ${validatedQuestions.length} questões importado via JSON.`,
        questions: validatedQuestions,
        createdAt: new Date().toISOString(),
        tags: ['Importado JSON', 'Offline'],
        timeLimitMinutes: Math.max(10, Math.round(validatedQuestions.length * 3)),
      };

      return { success: true, data: newSimulado };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro de sintaxe JSON';
      return {
        success: false,
        error: `Erro de formatação JSON: ${message}. Verifique vírgulas ou aspas duplicadas.`
      };
    }
  },

  // --- METAS DE ESTUDO FLEXÍVEIS ---
  getWeeklyStudyGoal(): WeeklyStudyGoal {
    try {
      const raw = readPersisted(STORAGE_KEYS.WEEKLY_GOAL);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Erro ao ler meta:', e);
    }
    return {
      activeDays: [1, 3, 5], // Seg (1), Qua (3), Sex (5) por padrão
      questionsPerStudyDay: 15,
    };
  },

  saveWeeklyStudyGoal(goal: WeeklyStudyGoal): void {
    try {
      persist(STORAGE_KEYS.WEEKLY_GOAL, JSON.stringify(goal));
    } catch (e) {
      console.error('Erro ao salvar meta:', e);
    }
  },

  getStudyPreferences(): StudyPreferences {
    try {
      const raw = readPersisted('simulify_study_preferences_v1');
      if (raw) return JSON.parse(raw) as StudyPreferences;
    } catch (e) {
      console.error('Erro ao ler preferências de estudo:', e);
    }

    return {
      focus: 'geral',
      goalMetric: 'questions',
      weeklyTarget: 30,
    };
  },

  saveStudyPreferences(preferences: StudyPreferences): void {
    persist('simulify_study_preferences_v1', JSON.stringify(preferences));
  },

  getWeeklyStudyProgress(): {
    answeredThisWeek: number;
    targetThisWeek: number;
    percentage: number;
    dailyBreakdown: Record<number, number>;
  } {
    const goal = this.getWeeklyStudyGoal();
    const results = this.getExamResults();

    const now = new Date();
    // In JS: 0=Sun, 1=Mon, ..., 6=Sat
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const dailyBreakdown: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let answeredThisWeek = 0;

    results.forEach((r) => {
      const d = new Date(r.completedAt);
      if (d >= monday) {
        const dow = d.getDay();
        const answered = Object.values(r.answers).filter((answer) => answer.selectedOption !== null).length;
        dailyBreakdown[dow] = (dailyBreakdown[dow] || 0) + answered;
        answeredThisWeek += answered;
      }
    });

    const targetThisWeek = goal.activeDays.length * goal.questionsPerStudyDay;
    const percentage = targetThisWeek > 0
      ? Math.min(100, Math.round((answeredThisWeek / targetThisWeek) * 100))
      : 0;

    return {
      answeredThisWeek,
      targetThisWeek,
      percentage,
      dailyBreakdown,
    };
  }
};
