import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ExamAnswerRecord } from '../../types';
import { CheckCircle2, Circle, Flag, Target } from 'lucide-react';

interface QuestionNavigationDockProps {
  totalQuestions: number;
  currentIdx: number;
  answers: Record<number, ExamAnswerRecord>;
  onSelectQuestion: (idx: number) => void;
  displayMode: 'step' | 'continuous';
}

export const QuestionNavigationDock: React.FC<QuestionNavigationDockProps> = ({
  totalQuestions,
  currentIdx,
  answers,
  onSelectQuestion,
  displayMode,
}) => {
  const [relativeY, setRelativeY] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Count metrics
  const answeredCount = Object.values(answers).filter((a) => a && a.selectedOption !== null).length;
  const reviewCount = Object.values(answers).filter((a) => a && a.markedForReview).length;
  const blankCount = Math.max(0, totalQuestions - answeredCount);
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Auto-scroll dock container to keep currentIdx visible without affecting the page scroll
  useEffect(() => {
    if (!isHovered && listRef.current && itemRefs.current[currentIdx]) {
      const container = listRef.current;
      const item = itemRefs.current[currentIdx];
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;
      if (itemTop < container.scrollTop) {
        container.scrollTo({ top: Math.max(0, itemTop - 8), behavior: 'smooth' });
      } else if (itemBottom > container.scrollTop + container.clientHeight) {
        container.scrollTo({ top: itemBottom - container.clientHeight + 8, behavior: 'smooth' });
      }
    }
  }, [currentIdx, isHovered]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (listRef.current) {
      const rect = listRef.current.getBoundingClientRect();
      setRelativeY(e.clientY - rect.top + listRef.current.scrollTop);
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRelativeY(null);
    setIsHovered(false);
  }, []);

  // Compute magnification scale using offsetTop (avoids layout thrashing)
  const getItemScale = (idx: number): number => {
    if (relativeY === null || !itemRefs.current[idx]) {
      return 1;
    }
    const item = itemRefs.current[idx];
    if (!item) return 1;

    const itemCenterY = item.offsetTop + item.offsetHeight / 2;
    const distance = Math.abs(relativeY - itemCenterY);
    const maxRadius = 75; // influence radius in pixels

    if (distance < maxRadius) {
      const factor = (Math.cos((distance / maxRadius) * Math.PI) + 1) / 2;
      return 1 + factor * 0.45; // peak scale 1.45x
    }
    return 1;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-40 select-none flex items-center"
      aria-label="Navegação lateral de questões"
    >
      {/* Floating Legend Panel - ONLY appears when hovering the dock */}
      <div
        className={`absolute right-full mr-3.5 top-1/2 -translate-y-1/2 transition-all duration-200 ease-out z-50 ${
          isHovered
            ? 'opacity-100 translate-x-0 pointer-events-auto scale-100'
            : 'opacity-0 translate-x-3 pointer-events-none scale-95'
        }`}
      >
        <div className="w-56 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-2xl text-xs space-y-3.5">
          {/* Legend Header */}
          <div className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Progresso</span>
              <span className="font-mono text-brand-600 dark:text-brand-400">
                {answeredCount}/{totalQuestions} ({progressPercent}%)
              </span>
            </div>
            {/* Mini Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Status Breakdown with colored bottom lines */}
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-1 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Respondidas</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {answeredCount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-1 rounded-full bg-amber-400 shadow-sm" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Marcadas p/ revisar</span>
              </div>
              <span className="font-mono font-bold text-amber-500">
                {reviewCount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Em branco</span>
              </div>
              <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
                {blankCount}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-1 rounded-full bg-brand-500 ring-2 ring-brand-500/30" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Questão atual</span>
              </div>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                #{currentIdx + 1}
              </span>
            </div>
          </div>

          {/* Legend Helper */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 text-center">
            Mova o mouse para zoom • Clique no número para ir
          </p>
        </div>
      </div>

      {/* Vertical Dock Rail */}
      <div className="p-1 sm:p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-black/5 flex flex-col items-center">
        {/* Scrollable list for exams with many questions */}
        <div
          ref={listRef}
          className="flex flex-col items-center gap-1.5 max-h-[75vh] overflow-y-auto overflow-x-visible py-1 px-0.5 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const rec = answers[idx];
            const isAnswered = rec && rec.selectedOption !== null;
            const isReview = rec && rec.markedForReview;
            const isCurrent = idx === currentIdx;
            const scale = getItemScale(idx);

            // Determine modern status line color & frame border
            let bottomLineColor = 'bg-slate-300 dark:bg-slate-700';
            let frameStyle =
              'border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-850/70';

            if (isCurrent) {
              frameStyle =
                'border-brand-500 dark:border-brand-400 ring-2 ring-brand-500/30 dark:ring-brand-400/30 bg-brand-50/90 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-extrabold shadow-sm';
              bottomLineColor = 'bg-brand-500 shadow-sm shadow-brand-500/50';
            } else if (isReview) {
              frameStyle =
                'border-amber-300/90 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold';
              bottomLineColor = 'bg-amber-400 shadow-sm shadow-amber-400/50';
            } else if (isAnswered) {
              frameStyle =
                'border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold';
              bottomLineColor = 'bg-emerald-500 shadow-sm shadow-emerald-500/50';
            }

            return (
              <button
                key={idx}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                title={`Questão ${idx + 1}${isReview ? ' (Marcada para revisão)' : isAnswered ? ' (Respondida)' : ' (Em branco)'}`}
                className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${frameStyle}`}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'right center',
                  zIndex: Math.round(scale * 10),
                  transition:
                    relativeY !== null
                      ? 'transform 75ms ease-out, box-shadow 75ms ease-out'
                      : 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease',
                }}
              >
                {/* Number */}
                <span className="font-mono text-[11px] sm:text-xs leading-none -translate-y-0.5">
                  {idx + 1}
                </span>

                {/* Status Bottom Line (linha inferior com a cor) */}
                <span
                  className={`absolute bottom-1 left-1.5 right-1.5 h-[2.5px] rounded-full transition-all duration-150 ${bottomLineColor}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigationDock;
