import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ showLabel?: boolean; className?: string }> = ({
  showLabel = false,
  className = '',
}) => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  return (
    <div className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 ${className}`}>
      <button
        type="button"
        onClick={() => setThemeMode('light')}
        title="Tema Claro"
        className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
          themeMode === 'light'
            ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Sun className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => setThemeMode('dark')}
        title="Tema Escuro"
        className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
          themeMode === 'dark'
            ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Moon className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => setThemeMode('system')}
        title="Automático (Segue o navegador)"
        className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
          themeMode === 'system'
            ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <Laptop className="w-4 h-4" />
        {showLabel && (
          <span className="text-[11px] font-medium pr-1">Auto ({resolvedTheme})</span>
        )}
      </button>
    </div>
  );
};
