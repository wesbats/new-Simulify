import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  debounceMs?: number; // Protection against rage double clicks
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  debounceMs = 500,
  disabled,
  onClick,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const [isClickLocked, setIsClickLocked] = useState(false);
  const unlockTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (unlockTimeoutRef.current) {
        window.clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading || isClickLocked) {
      e.preventDefault();
      return;
    }

    if (debounceMs > 0) {
      setIsClickLocked(true);
      if (unlockTimeoutRef.current) window.clearTimeout(unlockTimeoutRef.current);
      unlockTimeoutRef.current = window.setTimeout(() => {
        setIsClickLocked(false);
      }, debounceMs);
    }

    if (onClick) {
      onClick(e);
    }
  };

  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2.5 gap-2 font-semibold',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-brand-600 hover:bg-brand-500 text-[var(--primary-contrast,#fff)] shadow-sm hover:shadow-glow focus-visible:ring-brand-500 dark:focus-visible:ring-offset-slate-900 border border-brand-500/30',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 focus-visible:ring-slate-400',
    outline:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 focus-visible:ring-brand-500',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus-visible:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus-visible:ring-rose-500',
    subtle:
      'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200/50 dark:border-brand-800/40',
  };

  const isDisabled = disabled || isLoading || isClickLocked;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={isLoading || isClickLocked}
      onClick={handleClick}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none active:scale-100' : ''}
        ${className}
      `}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 animate-spin text-current flex-shrink-0" />
      )}
      {!isLoading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};
