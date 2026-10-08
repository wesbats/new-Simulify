import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Zap,
  Printer,
  ChevronDown,
  ChevronUp,
  Share2,
  TrendingUp,
  Award
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ExamResult, Simulado } from '../../types';
import { Button } from '../../components/common/Button';
import { AppShell } from '../../components/layout/AppShell';

export const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const res = storageService.getExamResultById(id);
    if (!res) {
      alert('Resultado não encontrado.');
      navigate('/app');
      return;
    }
    setResult(res);

    // Trigger confetti if high score!
    if (res.scorePercentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if canvas is not available
      }
    }
  }, [id, navigate]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500">Carregando resultado...</p>
      </div>
    );
  }

  const missedQuestions = result.questions.filter((_, idx) => {
    return !result.answers[idx]?.isCorrect;
  });
  const answeredCount = Object.values(result.answers).filter((answer) => answer.selectedOption !== null).length;

  const handleRetrainMissedOnly = () => {
    if (missedQuestions.length === 0) return;

    const reviewSimulado: Simulado = {
      id: `review-${Date.now()}`,
      title: `Revisão de Falhas: ${result.simuladoTitle}`,
      description: `Treino focado apenas nas ${missedQuestions.length} questões com erro do simulado anterior.`,
      questions: missedQuestions,
      createdAt: new Date().toISOString(),
      tags: ['Revisão Focada', 'Erros'],
      timeLimitMinutes: Math.max(5, missedQuestions.length * 3),
    };

    storageService.saveCustomSimulado(reviewSimulado);
    navigate(`/app/simulado/${reviewSimulado.id}`);
  };

  const handleRetakeFull = () => {
    navigate(`/app/simulado/${result.simuladoId}`);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const averageSecPerQuestion = answeredCount > 0
    ? Math.round(result.totalTimeSeconds / answeredCount)
    : 0;

  return (
    <AppShell
      title="Diagnóstico do simulado"
      description={`${result.simuladoTitle} · concluído às ${new Date(result.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
      actions={<Button variant="outline" size="sm" onClick={() => navigate(`/app/imprimir/${result.simuladoId}`)} leftIcon={<Printer className="w-4 h-4" />}>Imprimir A4</Button>}
    >
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top Diagnostic Card (from design-2.png) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Circular Score Visual Gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={
                    result.scorePercentage >= 70
                      ? 'stroke-emerald-500'
                      : result.scorePercentage >= 50
                      ? 'stroke-amber-500'
                      : 'stroke-rose-500'
                  }
                  strokeWidth="8"
                  strokeDasharray={263.9}
                  strokeDashoffset={263.9 * (1 - result.scorePercentage / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {result.scorePercentage}%
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Aproveitamento
                </span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300">
                {result.correctCount} de {answeredCount} respondidas corretamente
              </span>
            </div>
          </div>

          {/* Quick Metrics & Next Action */}
          <div className="md:col-span-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {result.scorePercentage >= 75
                  ? 'Desempenho Excelente! 🎉'
                  : result.scorePercentage >= 50
                  ? 'Bom ritmo! Há espaço para ajuste. 📈'
                  : 'Atenção aos pontos críticos. 💡'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                A aprovação em concurso é construída na identificação imediata dos erros.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Tempo Total</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-brand-500" />
                  {formatSeconds(result.totalTimeSeconds)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Média / Questão</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {averageSecPerQuestion}s
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Questões a Rever</span>
                <span className="text-sm font-bold text-rose-500 mt-0.5 block">
                  {missedQuestions.length}
                </span>
              </div>
            </div>

            {/* Retention Loop Action Bar (Quizlet-style) */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {missedQuestions.length > 0 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRetrainMissedOnly}
                  leftIcon={<Zap className="w-4 h-4" />}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Treinar Apenas as {missedQuestions.length} Questões que Errei
                </Button>
              ) : (
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Gabarito 100% perfeito! Nenhuma falha detectada.
                </div>
              )}

              <Button
                variant="outline"
                size="md"
                onClick={handleRetakeFull}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Refazer Simulado Completo
              </Button>
            </div>
          </div>
        </div>

        {/* Desempenho por Assunto (from design-2.png) */}
        {Object.keys(result.subjectBreakdown).length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Desempenho por Assunto
            </h3>

            <div className="space-y-3.5">
              {Object.entries(result.subjectBreakdown).map(([subject, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={subject} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {subject}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {stats.correct}/{stats.total} ({pct}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 70
                            ? 'bg-emerald-500'
                            : pct >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Question Review & Gabarito Comentado */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Gabarito Comentado e Análise Questão a Questão
            </h3>
            <span className="text-xs text-slate-500">
              Clique em qualquer questão para abrir a justificativa pedagógica
            </span>
          </div>

          <div className="space-y-3">
            {result.questions.map((q, idx) => {
              const ans = result.answers[idx];
              const isCorrect = ans?.isCorrect;
              const userOpt = ans?.selectedOption;
              const correctOpt = q.correct;
              const isExpanded = expandedQuestion === idx;

              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <div
                    onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                    onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setExpandedQuestion(isExpanded ? null : idx); } }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-controls={`result-question-${idx}`}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : userOpt === null
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : userOpt === null ? (
                          <HelpCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Questão {idx + 1}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            • {q.subject || 'Geral'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 mt-0.5">
                          {q.question}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : userOpt === null
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        {isCorrect ? 'Acertou' : userOpt === null ? 'Em Branco' : 'Errou'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div id={`result-question-${idx}`} className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 space-y-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {q.question}
                      </p>

                      {/* Alternatives list */}
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isThisCorrect = optIdx === correctOpt;
                          const isThisUserSelected = optIdx === userOpt;

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                                isThisCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold'
                                  : isThisUserSelected
                                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold bg-white/70 dark:bg-slate-800 text-[10px]">
                                  {['A', 'B', 'C', 'D', 'E'][optIdx]}
                                </span>
                                <span>{opt}</span>
                              </div>

                              <div className="flex items-center gap-1.5 font-bold">
                                {isThisCorrect && <span>Correta ✓</span>}
                                {isThisUserSelected && !isThisCorrect && <span>Sua resposta ✗</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pedagogical Explanation */}
                      {q.explanation && (
                        <div className="p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-900/50 text-xs text-brand-900 dark:text-brand-200 space-y-1">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-brand-700 dark:text-brand-400 block">
                            Justificativa do Gabarito
                          </span>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
};
