import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  monochrome?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  monochrome = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Monogram S from design-1.png */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 transition-transform duration-200 hover:scale-105`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="logoLinearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {/* Top Pill Ribbon */}
          <path
            d="M 66 18 L 36 36 C 26 42 26 54 36 60 L 46 66 C 51 69 56 65 56 59 L 56 54 C 56 50 58 47 62 44 L 74 37 C 81 33 79 21 70 18 C 69 17.5 67.5 17.5 66 18 Z"
            fill={monochrome ? 'currentColor' : 'url(#logoLinearGrad)'}
          />
          {/* Bottom Pill Ribbon */}
          <path
            d="M 34 82 L 64 64 C 74 58 74 46 64 40 L 54 34 C 49 31 44 35 44 41 L 44 46 C 44 50 42 53 38 56 L 26 63 C 19 67 21 79 30 82 C 31 82.5 32.5 82.5 34 82 Z"
            fill={monochrome ? 'currentColor' : 'url(#logoLinearGrad)'}
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-extrabold tracking-tight font-sans text-slate-900 dark:text-white ${textSizes[size]} leading-none`}
        >
          Simulify
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide mt-1">
            Pratique melhor. Passe preparado.
          </span>
        )}
      </div>
    </div>
  );
};
