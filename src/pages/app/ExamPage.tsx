import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Printer,
  Flag,
  Scissors,
  CheckCircle,
  HelpCircle,
  Save,
  Pause,
  Play,
  AlertTriangle,
  RotateCcw,
  LayoutList,
  Columns,
  Timer as TimerIcon
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Simulado, Question, ExamAnswerRecord, ActiveExamSession, ExamResult } from '../../types';
import { MarcadorVisual } from '../../components/exam/MarcadorVisual';
import { QuestionNavigationDock } from '../../components/exam/QuestionNavigationDock';
import { Button } from '../../components/common/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export const ExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [simulado, setSimulado] = useState<Simulado | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ExamAnswerRecord>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsedSeconds;
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const submitDialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isSubmitModalOpen, submitDialogRef, () => setIsSubmitModalOpen(false));
  const [lastSavedNotice, setLastSavedNotice] = useState<string>('Auto-save ativo');

  // Exam view modes: 'step' (one by one) or 'continuous' (all in page like the old app)
  const [displayMode, setDisplayMode] = useState<'step' | 'continuous'>(() => {
    return (localStorage.getItem('simulify_display_mode') as 'step' | 'continuous') || 'step';
  });

  const [columns, setColumns] = useState<1 | 2>(() => {
    const saved = localStorage.getItem('simulify_columns');
    return saved ? (parseInt(saved) as 1 | 2) : 2;
  });

  const [timerType, setTimerType] = useState<'cronometro' | 'marcador'>('marcador');

  const timerRef = useRef<number | null>(null);

  // Initialize or restore active session
  useEffect(() => {
    if (!id) return;
    const sim = storageService.getSimuladoById(id);
    if (!sim) {
      alert('Simulado não encontrado.');
      navigate('/app');
      return;
    }
    setSimulado(sim);

    // Read session config if set in ExamConfigPage
    try {
      const cfg = sessionStorage.getItem('simulify_exam_config');
      if (cfg) {
        const parsed = JSON.parse(cfg);
        if (parsed.displayMode) setDisplayMode(parsed.displayMode);
        if (parsed.columns) setColumns(parsed.columns);
        if (parsed.timerType) setTimerType(parsed.timerType);
      }
    } catch {}

    // Check if there was an active session for this exam
    const existingSession = storageService.getActiveExamSession();
    if (existingSession && existingSession.simuladoId === id) {
      setCurrentIdx(existingSession.currentQuestionIndex);
      setAnswers(existingSession.answers);
      setElapsedSeconds(existingSession.elapsedSeconds);
      setIsPaused(existingSession.isPaused);
    } else {
      const initial: Record<number, ExamAnswerRecord> = {};
      sim.questions.forEach((_, idx) => {
        initial[idx] = {
          selectedOption: null,
          eliminatedOptions: [],
          markedForReview: false,
          timeSpentSeconds: 0,
        };
      });
      setAnswers(initial);
      setElapsedSeconds(0);
    }
  }, [id, navigate]);

  // Live Timer
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const persistSession = useCallback(() => {
    if (!simulado) return;
    const session: ActiveExamSession = {
      simuladoId: simulado.id,
      simuladoTitle: simulado.title,
      questions: simulado.questions,
      currentQuestionIndex: currentIdx,
      answers,
      startedAt: new Date().toISOString(),
      elapsedSeconds: elapsedRef.current,
      isPaused,
    };

    storageService.saveActiveExamSession(session);
    setLastSavedNotice('Salvo no navegador ✓');
  }, [simulado, currentIdx, answers, isPaused]);

  // Respostas e navegação são salvas imediatamente; o relógio é agrupado em janelas de 5s.
  useEffect(() => { persistSession(); }, [answers, currentIdx, isPaused, persistSession]);
  useEffect(() => {
    if (elapsedSeconds > 0 && elapsedSeconds % 5 === 0) persistSession();
  }, [elapsedSeconds, persistSession]);

  useEffect(() => {
    if (!isSubmitModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsSubmitModalOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitModalOpen]);

  // Keyboard shortcut listeners (1-5 or A-E, arrows, R for review)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitModalOpen || isPaused || !simulado) return;

      const currentQ = simulado.questions[currentIdx];
      if (!currentQ) return;

      // Number keys 1-5
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= currentQ.options.length) {
        e.preventDefault();
        handleSelectOption(currentIdx, num - 1);
        return;
      }

      // Letters A-E
      const letterCode = e.key.toUpperCase();
      const optionLetters = ['A', 'B', 'C', 'D', 'E'];
      const letterIndex = optionLetters.indexOf(letterCode);
      if (letterIndex >= 0 && letterIndex < currentQ.options.length) {
        e.preventDefault();
        handleSelectOption(currentIdx, letterIndex);
        return;
      }

      // Arrows for question navigation (in step mode)
      if (displayMode === 'step') {
        if (e.key === 'ArrowRight' && currentIdx < simulado.questions.length - 1) {
          e.preventDefault();
          setCurrentIdx((prev) => prev + 1);
        } else if (e.key === 'ArrowLeft' && currentIdx > 0) {
          e.preventDefault();
          setCurrentIdx((prev) => prev - 1);
        }
      }

      // 'R' for mark review
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleToggleReview(currentIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitModalOpen, isPaused, simulado, currentIdx, answers, displayMode]);

  if (!simulado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500">Carregando simulado...</p>
      </div>
    );
  }

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    setAnswers((prev) => {
      const existing = prev[qIdx] || {
        selectedOption: null,
        eliminatedOptions: [],
        markedForReview: false,
        timeSpentSeconds: 0,
      };

      const newSelection = existing.selectedOption === optIdx ? null : optIdx;
      const newEliminated = existing.eliminatedOptions.filter((o) => o !== optIdx);

      return {
        ...prev,
        [qIdx]: {
          ...existing,
          selectedOption: newSelection,
          eliminatedOptions: newEliminated,
          markedForReview: false,
        },
      };
    });
  };

  const handleToggleEliminate = (e: React.MouseEvent, qIdx: number, optIdx: number) => {
    e.stopPropagation();
    setAnswers((prev) => {
      const existing = prev[qIdx] || {
        selectedOption: null,
        eliminatedOptions: [],
        markedForReview: false,
        timeSpentSeconds: 0,
      };

      const isEliminated = existing.eliminatedOptions.includes(optIdx);
      const newEliminated = isEliminated
        ? existing.eliminatedOptions.filter((o) => o !== optIdx)
        : [...existing.eliminatedOptions, optIdx];

      const newSelection = existing.selectedOption === optIdx ? null : existing.selectedOption;

      return {
        ...prev,
        [qIdx]: {
          ...existing,
          selectedOption: newSelection,
          eliminatedOptions: newEliminated,
        },
      };
    });
  };

  const handleToggleReview = (qIdx: number) => {
    setAnswers((prev) => {
      const existing = prev[qIdx] || {
        selectedOption: null,
        eliminatedOptions: [],
        markedForReview: false,
        timeSpentSeconds: 0,
      };
      return {
        ...prev,
        [qIdx]: {
          ...existing,
          markedForReview: !existing.markedForReview,
        },
      };
    });
  };

  const toggleDisplayMode = () => {
    const next = displayMode === 'step' ? 'continuous' : 'step';
    setDisplayMode(next);
    localStorage.setItem('simulify_display_mode', next);
  };

  const handleSelectQuestion = (idx: number) => {
    setCurrentIdx(idx);
    if (displayMode === 'continuous') {
      const el = document.getElementById(`q-${idx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalQuestions = simulado.questions.length;
  const answeredCount = Object.values(answers).filter((a) => a.selectedOption !== null).length;
  const reviewCount = Object.values(answers).filter((a) => a.markedForReview).length;
  const blankCount = totalQuestions - answeredCount;
  const totalMinutesAllocated = simulado.timeLimitMinutes || totalQuestions * 3;
  const remainingSecondsTimer = Math.max(0, totalMinutesAllocated * 60 - elapsedSeconds);

  const handleSubmitExam = () => {
    if (!simulado) return;

    let correctCount = 0;
    const answersRecord: ExamResult['answers'] = {};
    const subjectBreakdown: ExamResult['subjectBreakdown'] = {};

    simulado.questions.forEach((q, idx) => {
      const userAns = answers[idx]?.selectedOption ?? null;
      const isCorrect = userAns === q.correct;
      if (isCorrect) correctCount++;

      answersRecord[idx] = {
        selectedOption: userAns,
        isCorrect,
        correctOption: q.correct,
        explanation: q.explanation,
      };

      if (userAns !== null) {
        const sub = q.subject || 'Geral';
        if (!subjectBreakdown[sub]) subjectBreakdown[sub] = { total: 0, correct: 0 };
        subjectBreakdown[sub].total += 1;
        if (isCorrect) subjectBreakdown[sub].correct += 1;
      }
    });

    const scorePercentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    const result: ExamResult = {
      id: `result-${Date.now()}`,
      simuladoId: simulado.id,
      simuladoTitle: simulado.title,
      completedAt: new Date().toISOString(),
      totalQuestions,
      correctCount,
      scorePercentage,
      totalTimeSeconds: elapsedSeconds,
      answers: answersRecord,
      questions: simulado.questions,
      subjectBreakdown,
    };

    storageService.saveExamResult(result);
    navigate(`/app/resultado/${result.id}`);
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 3px Top Edge Dynamic Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-slate-200/60 dark:bg-slate-800/60 z-50">
        <div
          className="h-full bg-brand-500 shadow-sm transition-all duration-300 ease-out"
          style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
        />
      </div>

      {/* Floating Subtle Header Bar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0B0F19]/85 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 transition-all duration-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Deseja pausar e voltar ao painel? Seu progresso está salvo no navegador.')) {
                navigate('/app');
              }
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 active:scale-95"
            title="Pausar e voltar ao painel"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
              {simulado.title}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-medium text-brand-600 dark:text-brand-400">{answeredCount}/{totalQuestions} respondidas</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {lastSavedNotice}
              </span>
            </div>
          </div>
        </div>

        {/* Center Progress & Timer / Marcador Switch */}
        <div className="flex items-center gap-3">
          {timerType === 'cronometro' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>{formatTimer(elapsedSeconds)}</span>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={isPaused ? 'Retomar cronômetro' : 'Pausar cronômetro'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <MarcadorVisual
                remainingSeconds={remainingSecondsTimer}
                totalMinutes={totalMinutesAllocated}
              />
            </div>
          )}

          {/* Toggle between cronometro and marcador */}
          <button
            type="button"
            onClick={() => setTimerType(timerType === 'cronometro' ? 'marcador' : 'cronometro')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={timerType === 'cronometro' ? 'Mudar para Marcador de Lousa' : 'Mudar para Cronômetro Numérico'}
          >
            {timerType === 'cronometro' ? <TimerIcon className="w-4 h-4 text-brand-500" /> : <Clock className="w-4 h-4 text-brand-500" />}
          </button>

          {/* Toggle Display Mode: Step vs Continuous */}
          <button
            type="button"
            onClick={toggleDisplayMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:block"
            title={displayMode === 'step' ? 'Mudar para Todas as Questões na Página' : 'Mudar para Passo a Passo (1 questão)'}
          >
            {displayMode === 'step' ? <LayoutList className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/app/imprimir/${simulado.id}`)}
            className="hidden sm:inline-flex text-xs"
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Imprimir Prova A4
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSubmitModalOpen(true)}
            className="text-xs font-bold"
          >
            Revisar
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-5xl lg:max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 pr-12 sm:pr-14 md:pr-16 relative">
        {/* Left Side: Question Sheet */}
        <main className="w-full space-y-6">
          {/* Tip banner */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              💡 <strong>Dica de Concurso:</strong> Use a tesoura para riscar alternativas absurdas e chegar à resposta correta por eliminação.
            </span>
            <span className="font-semibold text-brand-600 dark:text-brand-400 hidden sm:inline">
              Modo: {displayMode === 'step' ? 'Passo a Passo' : 'Caderno Contínuo'}
            </span>
          </div>

          {/* ========================================================= */}
          {/* MODE 1: STEP BY STEP (1 Question at a time)              */}
          {/* ========================================================= */}
          {displayMode === 'step' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Question Header Meta */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold text-xs">
                    Questão {currentIdx + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {simulado.questions[currentIdx]?.subject || 'Geral'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleReview(currentIdx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    answers[currentIdx]?.markedForReview
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{answers[currentIdx]?.markedForReview ? 'Marcada para revisar' : 'Marcar para revisão (R)'}</span>
                </button>
              </div>

              {/* Statement */}
              <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-relaxed select-text">
                {simulado.questions[currentIdx]?.question}
              </div>

              {/* Alternatives */}
              <div className="space-y-3 pt-2">
                {simulado.questions[currentIdx]?.options.map((optionText, optIdx) => {
                  const letter = optionLetters[optIdx] || String(optIdx + 1);
                  const isSelected = answers[currentIdx]?.selectedOption === optIdx;
                  const isEliminated = answers[currentIdx]?.eliminatedOptions.includes(optIdx);

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(currentIdx, optIdx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectOption(currentIdx, optIdx);
                        }
                      }}
                      className={`group relative flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 dark:border-brand-500 ring-2 ring-brand-500/20'
                          : isEliminated
                          ? 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 opacity-45'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3.5 pr-3 text-left">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50'
                          }`}
                        >
                          {letter}
                        </div>
                        <div
                          className={`text-sm sm:text-base leading-relaxed pt-0.5 ${
                            isSelected
                              ? 'font-semibold text-brand-950 dark:text-brand-100'
                              : isEliminated
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {optionText}
                        </div>
                      </div>

                      <button
                        type="button"
                        title={isEliminated ? 'Restaurar alternativa' : 'Eliminar alternativa absurda'}
                        onClick={(e) => handleToggleEliminate(e, currentIdx, optIdx)}
                        className={`p-1.5 rounded-lg text-xs transition-opacity ${
                          isEliminated
                            ? 'opacity-100 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                            : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Scissors className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom step navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="md"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Anterior
                </Button>

                <span className="text-xs text-slate-400 hidden sm:inline">
                  Atalhos: Teclas 1 a {simulado.questions[currentIdx]?.options.length} • Setas para navegar
                </span>

                {currentIdx < totalQuestions - 1 ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Próxima
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 font-bold"
                  >
                    Revisar
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 2: CONTINUOUS BOOKLET (All Questions in Page)       */}
          {/* ========================================================= */}
          {displayMode === 'continuous' && (
            <div className={`space-y-6 ${columns === 2 ? 'md:columns-2 md:gap-6' : ''}`}>
              {simulado.questions.map((q, qIndex) => {
                const isSelectedAny = answers[qIndex]?.selectedOption !== null;
                const isMarkedReview = answers[qIndex]?.markedForReview;

                return (
                  <div
                    key={qIndex}
                    id={`q-${qIndex}`}
                    className="break-inside-avoid mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold text-xs">
                          Questão {qIndex + 1}
                        </span>
                        {q.subject && (
                          <span className="text-xs text-slate-400">
                            {q.subject}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleReview(qIndex)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isMarkedReview
                            ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title="Marcar para revisão"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white leading-relaxed">
                      {q.question}
                    </p>

                    <div className="space-y-2 pt-1">
                      {q.options.map((optionText, optIdx) => {
                        const letter = optionLetters[optIdx] || String(optIdx + 1);
                        const isSelected = answers[qIndex]?.selectedOption === optIdx;
                        const isEliminated = answers[qIndex]?.eliminatedOptions.includes(optIdx);

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(qIndex, optIdx)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectOption(qIndex, optIdx);
                              }
                            }}
                            className={`group relative flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer select-none text-xs sm:text-sm ${
                              isSelected
                                ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20'
                                : isEliminated
                                ? 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 opacity-45'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300'
                            }`}
                          >
                            <div className="flex min-w-0 flex-1 items-start gap-2.5 pr-2 text-left">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                                  isSelected
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {letter}
                              </span>
                              <span
                                className={`pt-0.5 leading-snug ${
                                  isSelected
                                    ? 'font-semibold text-brand-950 dark:text-brand-100'
                                    : isEliminated
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {optionText}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleToggleEliminate(e, qIndex, optIdx)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1"
                              title="Eliminar alternativa"
                            >
                              <Scissors className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 flex justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 font-bold"
                >
                  Revisar
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Sleek Vertical Navigation Dock with Fisheye Magnification */}
        <QuestionNavigationDock
          totalQuestions={totalQuestions}
          currentIdx={currentIdx}
          answers={answers}
          onSelectQuestion={handleSelectQuestion}
          displayMode={displayMode}
        />
      </div>

      {/* Confirmation Modal to Submit Exam */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150" role="presentation">
          <div ref={submitDialogRef} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5" role="dialog" aria-modal="true" aria-labelledby="submit-exam-title">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="submit-exam-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Finalizar Simulado?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Revise o resumo antes de computar seu resultado.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Respondidas</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {answeredCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Em branco</span>
                <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                  {blankCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Marcadas</span>
                <span className="text-lg font-bold text-amber-500">
                  {reviewCount}
                </span>
              </div>
            </div>

            {blankCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Atenção: você ainda possui {blankCount} questão(ões) sem resposta.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSubmitModalOpen(false)}
              >
                Voltar à Prova
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitExam}
                className="font-bold"
              >
                Sim, Entregar Prova
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
