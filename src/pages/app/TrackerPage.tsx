import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Timer as TimerIcon,
  Eye,
  EyeOff,
  Printer,
  Pause,
  Play,
  CheckCircle,
  FileCheck2,
  Award,
  AlertTriangle
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Simulado, ExamResult } from '../../types';
import { MarcadorVisual } from '../../components/exam/MarcadorVisual';
import { Button } from '../../components/common/Button';
import { AppShell } from '../../components/layout/AppShell';

export const TrackerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [simulado, setSimulado] = useState<Simulado | null>(null);
  const [timerType, setTimerType] = useState<'cronometro' | 'marcador'>('marcador');
  const [totalMinutes, setTotalMinutes] = useState(15);
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showBubbleTranscription, setShowBubbleTranscription] = useState(false);
  const [paperAnswers, setPaperAnswers] = useState<Record<number, number | null>>({});

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const sim = storageService.getSimuladoById(id);
    if (!sim) {
      alert('Simulado não encontrado.');
      navigate('/app');
      return;
    }
    setSimulado(sim);
    const mins = sim.timeLimitMinutes || sim.questions.length * 3;
    setTotalMinutes(mins);
    setRemainingSeconds(mins * 60);

    const initAnswers: Record<number, number | null> = {};
    sim.questions.forEach((_, idx) => {
      initAnswers[idx] = null;
    });
    setPaperAnswers(initAnswers);
  }, [id, navigate]);

  // Timer interval
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  if (!simulado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500">Carregando painel de acompanhamento...</p>
      </div>
    );
  }

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleComputePaperResult = () => {
    let correctCount = 0;
    const answersRecord: ExamResult['answers'] = {};
    const subjectBreakdown: ExamResult['subjectBreakdown'] = {};

    simulado.questions.forEach((q, idx) => {
      const userAns = paperAnswers[idx] ?? null;
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

    const elapsed = totalMinutes * 60 - remainingSeconds;
    const answeredCount = Object.values(paperAnswers).filter((answer) => answer !== null).length;
    const scorePercentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    const result: ExamResult = {
      id: `result-${Date.now()}`,
      simuladoId: simulado.id,
      simuladoTitle: simulado.title,
      completedAt: new Date().toISOString(),
      totalQuestions: simulado.questions.length,
      correctCount,
      scorePercentage,
      totalTimeSeconds: Math.max(elapsed, 1),
      answers: answersRecord,
      questions: simulado.questions,
      subjectBreakdown,
    };

    storageService.saveExamResult(result);
    navigate(`/app/resultado/${result.id}`);
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <AppShell title="Prova impressa" description="Acompanhe seu tempo e registre as respostas do caderno." actions={<div className="flex flex-wrap justify-end gap-2"><Button variant="outline" size="sm" onClick={() => navigate(`/app/imprimir/${simulado.id}`)} leftIcon={<Printer className="h-4 w-4" />}>Caderno A4</Button><Button variant="outline" size="sm" onClick={() => navigate('/app')} leftIcon={<ArrowLeft className="h-4 w-4" />}>Voltar</Button></div>}>
      {/* Main Central Display: Wall Clock / Board Tags */}
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center space-y-10 text-center">
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900/50">
            {timerType === 'marcador' ? 'Marcador de Lousa Oficial' : 'Cronômetro Digital de Parede'}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Resolva sua prova impressa na mesa. Este painel simula o relógio da sala de concurso.
          </p>
        </div>

        {/* Central Display Visual */}
        <div className="w-full py-8 flex flex-col items-center justify-center">
          {timerType === 'cronometro' ? (
            <div className="font-mono text-6xl sm:text-8xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums select-none drop-shadow-sm">
              {formatTimer(remainingSeconds)}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <MarcadorVisual
                remainingSeconds={remainingSeconds}
                totalMinutes={totalMinutes}
                className="justify-center"
              />
              <span className="text-xs text-slate-400 font-medium">
                Tempo restante aproximado: {Math.floor(remainingSeconds / 60)} min
              </span>
            </div>
          )}
        </div>

        {/* Timer Control Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsPaused(!isPaused)}
            leftIcon={isPaused ? <Play className="w-4 h-4 text-emerald-500" /> : <Pause className="w-4 h-4 text-amber-500" />}
          >
            {isPaused ? 'Retomar Tempo' : 'Pausar'}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setTimerType(timerType === 'cronometro' ? 'marcador' : 'cronometro')}
            leftIcon={timerType === 'cronometro' ? <TimerIcon className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          >
            {timerType === 'cronometro' ? 'Mudar para Marcador de Lousa' : 'Mudar para Cronômetro'}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setShowAnswers(!showAnswers)}
            leftIcon={showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          >
            {showAnswers ? 'Ocultar Gabarito' : 'Conferir Gabarito'}
          </Button>
        </div>

        {/* Answer Key Reveal (Protected under button click) */}
        {showAnswers && (
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-left space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Gabarito Oficial
              </h3>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setShowBubbleTranscription(true)}
                leftIcon={<FileCheck2 className="w-4 h-4" />}
              >
                Transcrever Respostas para Computar Nota
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {simulado.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    Q{idx + 1}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                    {optionLetters[q.correct]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bubble Transcription Card (Transfer paper answers to digital system) */}
        {showBubbleTranscription && <div className="w-full max-w-2xl p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Transcrever Gabarito do Papel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Terminou sua prova impressa? Marque suas respostas para computar sua nota e diagnóstico no dashboard.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleComputePaperResult}
              className="font-bold"
            >
              Computar Nota
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
            {simulado.questions.map((q, idx) => {
              const selected = paperAnswers[idx];
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-300 w-8">
                    Q{idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {optionLetters.slice(0, q.options.length).map((letter, optIdx) => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() =>
                          setPaperAnswers((prev) => ({
                            ...prev,
                            [idx]: selected === optIdx ? null : optIdx,
                          }))
                        }
                        className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                          selected === optIdx
                            ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/30'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-brand-500'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>}
      </div>
    </AppShell>
  );
};

export default TrackerPage;
