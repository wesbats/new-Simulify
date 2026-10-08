import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Shuffle,
  EyeOff,
  CheckCircle,
  HelpCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Simulado, Question } from '../../types';
import { Button } from '../../components/common/Button';
import { AppShell } from '../../components/layout/AppShell';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const ExamVerifyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [simulado, setSimulado] = useState<Simulado | null>(null);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showCorrect, setShowCorrect] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    const sim = storageService.getSimuladoById(id);
    if (!sim) {
      alert('Simulado não encontrado.');
      navigate('/app');
      return;
    }
    setSimulado(sim);
    setTitle(sim.title);
    setQuestions(sim.questions.map((q) => ({ ...q, options: [...q.options] })));
  }, [id, navigate]);

  if (!simulado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500">Carregando questões para verificação...</p>
      </div>
    );
  }

  const handleUpdateQuestionText = (index: number, text: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], question: text };
      return next;
    });
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, text: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIdx] };
      q.options = [...q.options];
      q.options[optIdx] = text;
      next[qIdx] = q;
      return next;
    });
  };

  const handleSetCorrect = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIdx] = { ...next[qIdx], correct: optIdx };
      return next;
    });
  };

  const handleUpdateSubject = (qIdx: number, text: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIdx] = { ...next[qIdx], subject: text };
      return next;
    });
  };

  const handleUpdateExplanation = (qIdx: number, text: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIdx] = { ...next[qIdx], explanation: text };
      return next;
    });
  };

  const handleShuffleQuestions = () => {
    setQuestions((prev) => shuffleArray(prev));
  };

  const handleShuffleOptions = () => {
    setQuestions((prev) =>
      prev.map((q) => {
        const opts = q.options;
        const correctText = opts[q.correct];
        const shuffled = shuffleArray(opts);
        const newCorrectIndex = shuffled.indexOf(correctText);
        return {
          ...q,
          options: shuffled,
          correct: newCorrectIndex >= 0 ? newCorrectIndex : 0,
        };
      })
    );
  };

  const handleSaveChanges = () => {
    const updated: Simulado = {
      ...simulado,
      title: title.trim(),
      questions,
    };
    storageService.saveCustomSimulado(updated);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };

  const handleStartExam = () => {
    handleSaveChanges();
    navigate(`/app/config/${simulado.id}`);
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <AppShell title="Verificar questões" description="Revise o conteúdo antes de iniciar seu simulado." actions={<div className="flex flex-wrap justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setShowCorrect(!showCorrect)}>{showCorrect ? 'Ocultar gabarito' : 'Mostrar gabarito'}</Button><Button variant="secondary" size="sm" onClick={handleSaveChanges}>{hasSaved ? 'Salvo ✓' : 'Salvar alterações'}</Button><Button variant="primary" size="sm" onClick={handleStartExam} rightIcon={<ArrowRight className="h-4 w-4" />}>Iniciar</Button></div>}>
      {/* Main Content */}
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Title & Quick Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Título do Simulado
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold bg-transparent border-b border-slate-200 dark:border-slate-800 pb-2 focus:outline-none focus:border-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Shuffle tools */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffleQuestions}
              leftIcon={<Shuffle className="w-3.5 h-3.5 text-brand-500" />}
            >
              Aleatorizar Ordem das Questões
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffleOptions}
              leftIcon={<Shuffle className="w-3.5 h-3.5 text-brand-500" />}
            >
              Aleatorizar Alternativas (A, B, C, D)
            </Button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold text-xs">
                  Questão {qIdx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">Matéria:</span>
                  <input
                    type="text"
                    value={q.subject || ''}
                    placeholder="Ex: História, Direito..."
                    onChange={(e) => handleUpdateSubject(qIdx, e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 w-36 sm:w-48"
                  />
                </div>
              </div>

              {/* Statement textarea */}
              <textarea
                rows={2}
                value={q.question}
                onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.correct === optIdx;
                  return (
                    <div key={optIdx} className="flex items-center gap-3">
                      <span className="w-6 font-bold text-xs text-slate-500">
                        {optionLetters[optIdx]})
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                        className={`flex-1 px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none ${
                          isCorrect && showCorrect
                            ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      />

                      {/* Correct answer indicator / selector */}
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={isCorrect}
                        onChange={() => handleSetCorrect(qIdx, optIdx)}
                        className={`w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-opacity ${
                          showCorrect ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        title="Marcar como alternativa correta"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Explanation / Resolução anti-spoiler */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                    <span>Explicação & Resolução Comentada</span>
                  </div>
                  {!showCorrect && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Oculto (Modo Anti-Spoiler)
                    </span>
                  )}
                </div>

                {showCorrect ? (
                  <textarea
                    rows={2}
                    placeholder="Adicione ou ajuste a explicação / comentário desta questão..."
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateExplanation(qIdx, e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCorrect(true)}
                    aria-label="Revelar explicação da questão"
                    className="p-3 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs cursor-pointer hover:border-brand-500/50 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 flex items-center justify-between"
                  >
                    <span>•••••••••••••••••••••••••••••••••••••••••••••••••• (Conteúdo protegido)</span>
                    <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium hover:underline">
                      Revelar
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default ExamVerifyPage;
