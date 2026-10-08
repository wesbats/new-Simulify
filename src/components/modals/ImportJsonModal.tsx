import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, FileJson, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Button } from '../common/Button';
import { Simulado } from '../../types';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimuladoImported: (simulado: Simulado, startImmediately: boolean) => void;
}

const SAMPLE_TEMPLATE = `{
  "title": "Direito Constitucional & Direitos Fundamentais",
  "questions": [
    {
      "question": "São direitos sociais previstos expressamente no art. 6º da Constituição Federal de 1988, EXCETO:",
      "options": [
        "A educação e a saúde",
        "O trabalho e a moradia",
        "O transporte e o lazer",
        "A livre concorrência e o livre mercado"
      ],
      "correct": 3,
      "explanation": "A livre concorrência é princípio geral da atividade econômica (art. 170), e não um direito social do art. 6º.",
      "subject": "Direito Constitucional",
      "difficulty": 2
    },
    {
      "question": "Qual remédio constitucional é cabível para assegurar o conhecimento de informações relativas à pessoa do impetrante constantes de registros públicos?",
      "options": [
        "Mandado de Segurança",
        "Habeas Data",
        "Habeas Corpus",
        "Ação Popular"
      ],
      "correct": 1,
      "explanation": "O Habeas Data (art. 5º, LXXII, 'a') destina-se a assegurar o conhecimento de informações relativas à pessoa do impetrante.",
      "subject": "Direito Constitucional",
      "difficulty": 1
    }
  ]
}`;

export const ImportJsonModal: React.FC<ImportJsonModalProps> = ({
  isOpen,
  onClose,
  onSimuladoImported,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [previewSimulado, setPreviewSimulado] = useState<Simulado | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(isOpen, dialogRef, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleLoadSample = () => {
    setJsonText(SAMPLE_TEMPLATE);
    setErrorMessage(null);
    validateJson(SAMPLE_TEMPLATE);
  };

  const validateJson = (text: string) => {
    if (!text.trim()) {
      setErrorMessage(null);
      setPreviewSimulado(null);
      return null;
    }
    const result = storageService.parseAndValidateSimuladoJSON(text);
    if (!result.success) {
      setErrorMessage(result.error || 'JSON inválido');
      setPreviewSimulado(null);
      return null;
    } else {
      setErrorMessage(null);
      setPreviewSimulado(result.data || null);
      return result.data;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    validateJson(val);
  };

  const handleSaveAndStart = (startImmediately: boolean) => {
    const valid = validateJson(jsonText);
    if (!valid) return;

    storageService.saveCustomSimulado(valid);
    onSimuladoImported(valid, startImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
      <div ref={dialogRef} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="import-json-title">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 id="import-json-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Importar Simulado em JSON
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cole o JSON de questões. Salvo localmente sem depender de IA ou login.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar importação"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Editor JSON
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors"
              >
                {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTemplate ? 'Modelo Copiado!' : 'Copiar Modelo JSON'}
              </button>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/50 hover:bg-brand-100 font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Preencher com Exemplo
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={jsonText}
              onChange={handleTextChange}
              placeholder={`Cole aqui o JSON no formato:\n{\n  "title": "Nome do Simulado",\n  "questions": [\n    {\n      "question": "Enunciado...",\n      "options": ["A", "B", "C", "D"],\n      "correct": 1,\n      "explanation": "Comentário pedagógico..."\n    }\n  ]\n}`}
              className="w-full h-56 p-3.5 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
            />
          </div>

          {/* Validation Feedback */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro de validação:</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {previewSimulado && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <strong>JSON Válido!</strong> "{previewSimulado.title}" com {previewSimulado.questions.length} questões identificadas.
                </span>
              </div>
              <span className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-[11px]">
                {previewSimulado.questions.length} Questões
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!previewSimulado}
              onClick={() => handleSaveAndStart(false)}
            >
              Salvar na Biblioteca
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!previewSimulado}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => handleSaveAndStart(true)}
            >
              Iniciar Simulado Agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
