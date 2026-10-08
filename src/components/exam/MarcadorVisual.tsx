import React from 'react';

interface MarcadorVisualProps {
  remainingSeconds: number;
  totalMinutes: number;
  className?: string;
}

export const MarcadorVisual: React.FC<MarcadorVisualProps> = ({
  remainingSeconds,
  totalMinutes,
  className = '',
}) => {
  const remainingMinutes = Math.floor(remainingSeconds / 60);

  const marks: number[] = [];
  const maxAbove60 = Math.ceil(totalMinutes / 30) * 30;
  for (let m = maxAbove60; m >= 60; m -= 30) {
    if (m <= totalMinutes) marks.push(m);
  }
  for (let m = 60; m >= 0; m -= 15) {
    if (m < 60 && m <= totalMinutes && !marks.includes(m)) marks.push(m);
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 select-none ${className}`}>
      {marks.map((mark) => {
        const visible = remainingMinutes >= mark;
        if (!visible) return null;
        const isLarge = mark >= 60;

        if (isLarge) {
          const hours = mark / 60;
          const label = Number.isInteger(hours) ? `${hours}h` : `${Math.floor(hours)}h30`;
          const isWarning = mark <= 60;

          return (
            <span
              key={mark}
              className={`inline-flex items-center justify-center rounded-lg border px-3 py-1 font-mono text-xs sm:text-sm font-bold tabular-nums transition-all duration-300 shadow-sm ${
                isWarning
                  ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/70 dark:text-amber-300'
                  : 'border-slate-300 bg-white text-slate-800 dark:border-slate-750 dark:bg-slate-800 dark:text-slate-100'
              }`}
              title={`Ainda restam pelo menos ${mark} minutos`}
            >
              {label}
            </span>
          );
        }

        return (
          <span
            key={mark}
            className="inline-flex items-center justify-center rounded-lg border border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/70 px-2.5 py-1 font-mono text-xs sm:text-sm font-bold tabular-nums text-rose-700 dark:text-rose-300 transition-all duration-300 shadow-sm animate-pulse"
            title={`Reta final: restam ${mark} minutos`}
          >
            {mark}&apos;
          </span>
        );
      })}
    </div>
  );
};

export default MarcadorVisual;
