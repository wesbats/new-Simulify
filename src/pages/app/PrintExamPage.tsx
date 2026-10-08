import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Clock, Timer, Eye, CheckCircle2, RotateCcw } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Simulado } from '../../types';
import { Button } from '../../components/common/Button';
import { 
  escapeHtml, 
  buildWritingPhrases, 
  buildAnswerTable, 
  buildReviewAnswerSheet 
} from '../../utils/print';

export const PrintExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [simulado, setSimulado] = useState<Simulado | null>(null);
  const [columns, setColumns] = useState<1 | 2>(2);
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  useEffect(() => {
    if (!id) return;
    const sim = storageService.getSimuladoById(id);
    if (!sim) {
      alert('Simulado não encontrado.');
      navigate('/app');
      return;
    }
    setSimulado(sim);
  }, [id, navigate]);

  const randomPhrase = useMemo(() => {
    const phrases = buildWritingPhrases();
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, []);

  if (!simulado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Carregando caderno de prova...</p>
      </div>
    );
  }

  const totalQuestions = simulado.questions.length;
  const today = new Date().toLocaleDateString('pt-BR');
  const timerMinutes = simulado.timeLimitMinutes || totalQuestions * 3;

  const answerTableHtml = buildAnswerTable(totalQuestions, simulado.questions);
  const reviewData = buildReviewAnswerSheet(simulado.questions);

  const handlePrint = () => {
    window.print();
  };

  const handleGoToTracker = () => {
    navigate(`/app/tracker/${simulado.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* On-Screen Action Toolbar (Hidden in print) */}
      <div className="no-print sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Voltar ao painel"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">
              Caderno de Prova Oficial (Concurso / ENEM)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {simulado.title} • {totalQuestions} questões • Padrão A4 com folha de respostas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Layout Columns Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setColumns(1)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                columns === 1 ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              1 Coluna
            </button>
            <button
              type="button"
              onClick={() => setColumns(2)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                columns === 2 ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              2 Colunas (Econômico)
            </button>
          </div>

          {/* Toggle Answer Key */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAnswerKey}
              onChange={(e) => setShowAnswerKey(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Gabarito Oficial no Final</span>
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToTracker}
            leftIcon={<Timer className="w-4 h-4 text-brand-500" />}
            title="Usar computador/tablet apenas como relógio de parede"
          >
            Abrir Relógio de Lousa (Tracker)
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
            className="shadow-md"
          >
            Imprimir Caderno (Ctrl + P)
          </Button>
        </div>
      </div>

      {/* Screen Guide Hint */}
      <div className="no-print max-w-4xl mx-auto my-4 p-4 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50 text-brand-950 dark:text-brand-200 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
          <p>
            <strong>Simulação Realista:</strong> A folha de rosto abaixo contém o <strong>Cartão-Resposta oficial</strong> e a <strong>Frase de Transcrição Caligráfica do ENEM</strong>. As questões começam na página seguinte com quebra de página automática.
          </p>
        </div>
        <Button
          variant="subtle"
          size="sm"
          onClick={handleGoToTracker}
          className="flex-shrink-0 text-xs"
        >
          Iniciar Cronômetro da Prova
        </Button>
      </div>

      {/* Printable Sheet (Standard A4 Booklet Document) */}
      <div className="print-wrap bg-white my-6 shadow-2xl max-w-[210mm] mx-auto border border-slate-300 print:m-0 print:border-none print:shadow-none">
        <div className={`print-doc ${columns === 2 ? 'print-columns-2' : ''}`}>
          {/* Folha de Rosto Oficial */}
          <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-3.5">
            <div>
              <div className="text-[8.5pt] uppercase tracking-wider text-gray-600 font-serif font-bold">
                SIMULIFY · CADERNO OFICIAL DE QUESTÕES
              </div>
              <h1 className="m-0 font-serif font-bold text-xl uppercase">
                {escapeHtml(simulado.title)}
              </h1>
            </div>
            <div className="text-right text-[8.5pt] font-serif text-gray-700">
              <div>{today}</div>
              <div>{totalQuestions} questões · {columns === 2 ? '2 colunas' : '1 coluna'}</div>
            </div>
          </div>

          {/* Info Grid (Identificação do Candidato) */}
          <div className="info-grid font-serif">
            <div>
              <div className="label">Nome completo do candidato</div>
              <div className="field"></div>
            </div>
            <div>
              <div className="label">Documento / Inscrição</div>
              <div className="field"></div>
            </div>
            <div>
              <div className="label">Data de Realização</div>
              <div className="field"></div>
            </div>
            <div>
              <div className="label">Assinatura do Candidato</div>
              <div className="field"></div>
            </div>
          </div>

          {/* Caixa de Instruções da Banca */}
          <div className="instructions font-serif">
            <strong>INSTRUÇÕES GERAIS AO CANDIDATO</strong>
            <ul>
              <li>Confira se este caderno contém a quantidade de questões indicada ({totalQuestions} questões).</li>
              <li>Marque <strong>apenas uma</strong> alternativa por questão na folha de respostas abaixo.</li>
              <li>Preencha a bolha do gabarito completamente utilizando caneta esferográfica de tinta <strong>preta ou azul</strong>.</li>
              <li>Não rasure a folha de respostas. Questões com dupla marcação serão anuladas.</li>
              <li>Tempo máximo sugerido para resolução: <strong>{timerMinutes} minutos</strong> (média de {(timerMinutes / totalQuestions).toFixed(1)} min/questão).</li>
            </ul>
          </div>

          {/* Cartão-Resposta Oficial (Bubble Grid) */}
          <div className="answer-sheet font-serif">
            <div className="answer-sheet-title">FOLHA DE RESPOSTAS (CARTÃO RASCUNHO)</div>
            <div dangerouslySetInnerHTML={{ __html: answerTableHtml }} />
          </div>

          {/* Transcrição Caligráfica do ENEM */}
          <div className="writing-practice font-serif">
            <div className="writing-practice-title">
              Transcreva com sua caligrafia usual considerando letras maiúsculas e minúsculas, a seguinte frase:
            </div>
            <div className="writing-practice-phrase font-serif">
              &ldquo;{randomPhrase}&rdquo;
            </div>
            <div className="writing-lines">
              <div className="writing-line"></div>
            </div>
          </div>

          {/* QUEBRA DE PÁGINA OBRIGATÓRIA ANTES DAS QUESTÕES */}
          <div style={{ pageBreakBefore: 'always' }} className="pt-4">
            <h2>Caderno de Questões</h2>
            <div className="print-questions-grid">
              {simulado.questions.map((q, idx) => {
                const letters = ['A', 'B', 'C', 'D', 'E'];
                return (
                  <div key={idx} className="print-question">
                    <div className="q-header font-serif">
                      <span className="q-num">Questão {idx + 1}.</span>
                      {q.subject && (
                        <span className="q-meta font-serif">({q.subject})</span>
                      )}
                    </div>
                    <div className="q-text font-serif">
                      {q.question}
                    </div>
                    <ul className="q-options font-serif">
                      {q.options.map((opt, optIdx) => (
                        <li key={optIdx}>
                          <span className="letter font-serif">
                            {letters[optIdx]})
                          </span>
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gabarito Oficial ao Final (Se selecionado) */}
          {showAnswerKey && (
            <div style={{ pageBreakBefore: 'always' }} className="pt-6 font-serif">
              <h2>Gabarito Oficial & Comentários</h2>
              <div className="answer-sheet">
                <table className="rkey">
                  <tbody
                    dangerouslySetInnerHTML={{
                      __html: reviewData.headerHtml + reviewData.rowsHtml,
                    }}
                  />
                </table>
              </div>

              <div className="mt-6 space-y-3 text-[9.5pt]">
                {simulado.questions.map((q, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-2">
                    <strong>Questão {idx + 1}:</strong> Opção ({['A', 'B', 'C', 'D', 'E'][q.correct]})
                    {q.explanation && (
                      <p className="text-gray-700 italic mt-0.5">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rodapé Oficial da Prova */}
          <div className="print-footer font-serif">
            Fim da prova · {simulado.title} · {totalQuestions} questões · Gerado por Simulify
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintExamPage;
