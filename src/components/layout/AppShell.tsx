import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Home,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface AppShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const navigation = [
  { to: '/app', label: 'Início', icon: Home, end: true },
  { to: '/app/simulados', label: 'Simulados', icon: BookOpen },
  { to: '/app/questoes', label: 'Questões', icon: BookOpen },
  { to: '/app/desempenho', label: 'Desempenho', icon: BarChart3 },
];

export const AppShell: React.FC<AppShellProps> = ({ title, description, actions, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('simulify_sidebar_collapsed') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(mobileOpen, drawerRef, () => setMobileOpen(false));

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem('simulify_sidebar_collapsed', String(next));
      return next;
    });
  };

  const isActive = (to: string, end?: boolean) => end
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(`${to}/`);

  const sidebar = (mobile = false) => (
    <aside ref={mobile ? drawerRef : undefined} id={mobile ? 'simulify-mobile-nav' : undefined} className={`flex h-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 ${mobile ? 'w-[280px]' : collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-3 dark:border-slate-800">
        <button
          type="button"
          aria-label={mobile ? 'Fechar menu' : collapsed ? 'Expandir menu' : 'Recolher menu'}
          onClick={mobile ? () => setMobileOpen(false) : toggleCollapsed}
          className="group relative flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          {mobile ? <X className="h-5 w-5" /> : (
            <>
              <Logo size="sm" className="transition-opacity group-hover:opacity-0" />
              <span className="absolute opacity-0 transition-opacity group-hover:opacity-100">
                {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </span>
            </>
          )}
        </button>
        {!collapsed && !mobile && <span className="pr-2 text-xs font-medium text-slate-400">Modo local</span>}
      </div>

      <nav aria-label="Navegação principal" className="space-y-1 p-3">
        {navigation.map(({ to, label, icon: Icon, end }) => {
          const active = isActive(to, end);
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => mobile && setMobileOpen(false)}
              title={collapsed && !mobile ? label : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${collapsed && !mobile ? 'justify-center px-0' : ''} ${active ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {(!collapsed || mobile) && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-100 p-3 dark:border-slate-800">
        <NavLink
          to="/app/configuracoes"
          onClick={() => mobile && setMobileOpen(false)}
          title={collapsed && !mobile ? 'Configurações' : undefined}
          className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-900 ${collapsed && !mobile ? 'justify-center px-0' : ''} ${isActive('/app/configuracoes') ? 'bg-slate-100 font-semibold dark:bg-slate-900' : ''}`}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {(!collapsed || mobile) && <span>Configurações</span>}
        </NavLink>
        {(!collapsed || mobile) && <p className="px-3 text-[11px] leading-4 text-slate-400">Seus dados ficam neste dispositivo.</p>}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[var(--surface-dark)] dark:text-slate-100">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block">{sidebar()}</div>
      {mobileOpen && <div className="fixed inset-0 z-50 md:hidden"><button aria-label="Fechar menu" className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} /><div className="relative h-full">{sidebar(true)}</div></div>}

      <div className={`min-w-0 min-h-screen overflow-x-hidden transition-[margin] duration-200 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'}`}>
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur dark:border-slate-800/80 dark:bg-[var(--surface-dark)]/90">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button ref={menuButtonRef} type="button" aria-label="Abrir menu" aria-expanded={mobileOpen} aria-controls="simulify-mobile-nav" onClick={() => setMobileOpen(true)} className="min-h-11 min-w-11 rounded-xl text-slate-600 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"><Menu className="mx-auto h-5 w-5" /></button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
                {description && <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">{description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <div className="hidden sm:block"><ThemeToggle /></div>
              <button type="button" onClick={() => navigate('/app/configuracoes')} aria-label="Abrir configurações" className="hidden h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 hover:bg-brand-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:flex dark:bg-brand-950 dark:text-brand-300">W</button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
};
