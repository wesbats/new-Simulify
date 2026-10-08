import React, { useRef } from 'react';
import { X, Check, Palette } from 'lucide-react';
import { useTheme, PRESET_THEME_COLORS } from '../../context/ThemeContext';
import { Button } from './Button';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ThemeColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeColorPicker: React.FC<ThemeColorPickerProps> = ({ isOpen, onClose }) => {
  const { primaryColor, setPrimaryColor } = useTheme();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, dialogRef, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-color-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 id="theme-color-title" className="text-base font-bold text-slate-900 dark:text-white">
                Personalizar Cores
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Escolha a cor de destaque do Simulify
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar personalização de cores"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Paleta de Destaque
          </label>
          <div className="grid grid-cols-4 gap-3 pt-1">
            {PRESET_THEME_COLORS.map((preset) => {
              const isSelected = primaryColor.toLowerCase() === preset.value.toLowerCase();
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setPrimaryColor(preset.value)}
                  className={`h-10 rounded-xl transition-all flex items-center justify-center text-white relative shadow-sm hover:scale-105 ${
                    isSelected ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-105' : ''
                  }`}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Hex Color */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cor Personalizada
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">
              {primaryColor}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button variant="primary" size="sm" onClick={onClose}>
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
};
