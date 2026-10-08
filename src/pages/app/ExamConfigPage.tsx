import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Printer,
  Clock,
  Timer,
  LayoutList,
  Columns,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle,
  FileEdit,
  Eye
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Simulado } from '../../types';
import { Button } from '../../components/common/Button';
import { AppShell } from '../../components/layout/AppShell';

export const ExamConfigPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [simulado, setSimulado] = useState<Simulado | null>(null);

  // User preferences (saved in localStorage)
  const [displayMode, setDisplayMode] = useState<'step' | 'continuous'>(() => {
    return (localStorage.getItem('simulify_display_mode') as 'step' | 'continuous') || 'step';
  });

  const [columns, setColumns] = useState<1 | 2>(() => {
    const saved = localStorage.getItem('simulify_columns');
    return saved ? (parseInt(saved) as 1 | 2) : 2;
  });

  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerType, setTimerType] = useState<'cronometro' | 'marcador'>('marcador');
  const [timerMinutes, setTimerMinutes] = useState(15);

  useEffect(() => {
    if (!id) return;
    const sim = storageService.getSimuladoById(id);
    if (!sim) {
      alert('Simulado não encontrado.');
      navigate('/app');
      return;
    }
    setSimulado(sim);

    // Automation of time: 3 minutes per question
    const autoMinutes = sim.timeLimitMinutes || sim.questions.length * 3;
    setTimerMinutes(autoMinutes);
  }, [id, navigate]);

  if (!simulado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500">Carregando configurações...</p>
      </div>
    );
  }

  const totalQuestions = simulado.questions.length;
  const minutesPerQuestion = totalQuestions > 0 ? (timerMinutes / totalQuestions).toFixed(1) : '3.0';

  const handleSaveDisplayMode = (mode: 'step' | 'continuous') => {
    setDisplayMode(mode);
    localStorage.setItem('simulify_display_mode', mode);
  };

  const handleSaveColumns = (cols: 1 | 2) => {
    setColumns(cols);
    localStorage.setItem('simulify_columns', String(cols));
  };

  const handleStartExamOnline = () => {
    // Save temporary config for this session
    sessionStorage.setItem('simulify_exam_config', JSON.stringify({
      displayMode,
      columns,
      timerEnabled,
      timerType,
      timerMinutes,
    }));
    navigate(`/app/simulado/${simulado.id}`);
  };

  return (
    <AppShell
      title="Configurar simulado"
      description="Personalize a experiência antes de começar."
      actions={<Button variant="outline" size="sm" onClick={() => navigate(`/app/verificar/${simulado.id}`)} leftIcon={<FileEdit className="w-4 h-4 text-brand-500" />}>Verificar questões</Button>}
    >
      <main className="mx-auto max-w-3xl space-y-8">
        {/* Simulado Meta Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Simulado Selecionado
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {simulado.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {totalQuestions} questões • Salvo localmente
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/app/imprimir/${simulado.id}`)}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Imprimir Prova A4
            </Button>
          </div>
        </div>

        {/* Configuration Sections */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Section 1: Modo de Visualização da Prova */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-brand-500" /> Modo de Visualização na Tela
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Defina como prefere resolver suas questões online (sua preferência fica salva).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => handleSaveDisplayMode('step')}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleSaveDisplayMode('step'); } }}
                role="radio"
                aria-checked={displayMode === 'step'}
                tabIndex={0}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  displayMode === 'step'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Passo a Passo (Foco Único)
                  </span>
                  {displayMode === 'step' && <CheckCircle className="w-4 h-4 text-brand-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Uma questão por vez com navegação por teclado e sem distrações.
                </p>
              </div>

              <div
                onClick={() => handleSaveDisplayMode('continuous')}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleSaveDisplayMode('continuous'); } }}
                role="radio"
                aria-checked={displayMode === 'continuous'}
                tabIndex={0}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  displayMode === 'continuous'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Todas na Página (Simulação de Caderno)
                  </span>
                  {displayMode === 'continuous' && <CheckCircle className="w-4 h-4 text-brand-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Todas as questões listadas de uma vez com âncoras na lateral.
                </p>
              </div>
            </div>

            {/* Layout Columns Option (Relevant when continuous or print) */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Colunas de Exibição
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Em 2 colunas, o espaço horizontal é aproveitado como numa prova impressa.
                </p>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleSaveColumns(1)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    columns === 1 ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  1 Coluna
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveColumns(2)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    columns === 2 ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  2 Colunas
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Temporizador e Automação de Tempo */}
          <div className="pt-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-500" /> Controle de Tempo & Simulação
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Automação pré-calculada: padrão de 3 minutos por questão de concurso.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={timerEnabled}
                  onChange={(e) => setTimerEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            {timerEnabled && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
                {/* Timer Type Selector */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estilo do Temporizador:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTimerType('marcador')}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        timerType === 'marcador'
                          ? 'border-brand-500 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-brand-500'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                        Marcador de Lousa Oficial
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Etiquetas de 30m e 15m que somem como o fiscal retirando do quadro.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimerType('cronometro')}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        timerType === 'cronometro'
                          ? 'border-brand-500 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-brand-500'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                        Cronômetro Digital Preciso
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Contagem regressiva numérica exata segundo a segundo.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Duration Inputs */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Duração Total:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={480}
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center"
                    />
                    <span className="text-xs text-slate-500">minutos</span>
                  </div>

                  <span className="text-xs font-mono text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg">
                    ≈ {minutesPerQuestion} min / questão
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions: Digital vs Paper vs Verify */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/app')}
          >
            Cancelar
          </Button>

          <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(`/app/tracker/${simulado.id}`)}
              leftIcon={<Timer className="w-4 h-4 text-brand-500" />}
            >
              Fazer no Papel (Tracker)
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleStartExamOnline}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold shadow-glow"
            >
              Iniciar Simulado Online
            </Button>
          </div>
        </div>
      </main>
    </AppShell>
  );
};

export default ExamConfigPage;
