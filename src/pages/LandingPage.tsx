import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Printer, 
  FileJson, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToApp = (action?: string) => {
    if (action === 'guest') {
      navigate('/app/guest');
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Glow effects in background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-brand-600/20 via-accent-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-80 right-0 w-[450px] h-[450px] bg-cyan-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F19]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo size="md" className="cursor-pointer" />
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
              <a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a>
              <a href="#impressao" className="hover:text-white transition-colors">Modo Concurso</a>
              <a href="#offline" className="hover:text-white transition-colors">Uso Sem Login</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => handleGoToApp()}
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors hidden sm:block"
            >
              Entrar
            </button>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => handleGoToApp()}
              className="shadow-glow"
            >
              Começar grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              <span>Simulados • Questões • Modo Concurso • Diagnóstico</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Estude melhor.{' '}
              <span className="text-brand-300">
                Passe na prova.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Simulados inteligentes, cronômetro de prova real, análise profunda de pontos fracos e caderno de impressão oficial para concurseiros e vestibulandos evoluírem de verdade.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                size="lg"
                variant="primary"
                leftIcon={<Zap className="w-5 h-5" />}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={() => handleGoToApp()}
                className="w-full sm:w-auto shadow-glow text-base font-bold px-8"
              >
                Criar meu primeiro simulado
              </Button>
              <Button
                size="lg"
                variant="secondary"
                leftIcon={<FileJson className="w-4 h-4 text-brand-400" />}
                onClick={() => handleGoToApp('guest')}
                className="w-full sm:w-auto text-base border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
              >
                Testar sem login (Local-First)
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Salva no seu navegador
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Compatível com ENEM e Concursos
              </span>
            </div>
          </div>

          {/* Hero Right Visual Showcase (Interactive Preview Mockup from design-2) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer card glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-accent-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-100 transition duration-1000"></div>

              <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-6">
                {/* Metric showcase header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Diagnóstico do Aluno
                    </span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      História do Brasil <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">+16% vs. anterior</span>
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
                    <Target className="w-5 h-5" />
                  </div>
                </div>

                {/* Score Circular Visual */}
                <div className="flex items-center justify-around py-2">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-brand-500"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 * (1 - 0.78)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-white">78%</span>
                      <span className="text-[10px] text-slate-400 font-medium">Aproveitamento</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span>31 Questões Corretas</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                      <span>9 Questões a Revisar</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-400"></span>
                      <span>Tempo Médio: 1m 45s</span>
                    </div>
                  </div>
                </div>

                {/* Micro Gamification Banner */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">Você evoluiu hoje!</h4>
                    <p className="text-[11px] text-slate-400">Parabéns: você superou sua meta diária de resolução.</p>
                  </div>
                </div>

                {/* Next Best Action (Quizlet Loop) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-brand-400" />
                      Próximo passo recomendado
                    </span>
                    <span className="text-[11px] text-brand-400 font-medium">3 min</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Você errou 3 questões sobre <strong>Período Regencial</strong>. Faça um mini-treino rápido para fixar.
                  </p>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => handleGoToApp()}
                    className="w-full text-xs"
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Treinar agora apenas as 3 erradas
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Pillars (From design-2.png) */}
      <section id="recursos" className="py-20 border-t border-slate-850 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
              Arquitetura de Alto Rendimento
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Tudo o que você precisa para sair da média e conquistar sua vaga
            </h2>
            <p className="text-sm text-slate-400">
              Construído para substituir planilhas confusas e plataformas antiquadas por um ecossistema ágil, focado e moderno.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Simulados Rápidos & JSON</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Importe seus próprios cadernos em JSON com 1 clique ou resolva os simulados modelo pré-carregados para ENEM e grandes bancas.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-accent-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center text-accent-400 mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Análise Completa</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Descubra exatamente onde você está perdendo pontos por matéria e acompanhe seu tempo médio por questão para dominar o relógio.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Caderno de Impressão Oficial</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Imprima cadernos em folha A4 com 2 colunas, instruções da banca e cartão-resposta com bolinhas para treinar com caneta preta.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">100% Local-First Sem Login</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero atrito: comece imediatamente sem fornecer senha ou cartão. Todo o progresso fica seguro no seu navegador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (O Loop Pedagógico) */}
      <section id="como-funciona" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent-400">
            O Método Simulify
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Como transformar horas de estudo em aprovação real
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <span className="text-3xl font-black text-brand-400/30">01</span>
            <h3 className="text-xl font-bold text-white">Importe ou Selecione</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Escolha entre nossos simulados pré-carregados ou cole qualquer JSON com suas questões de interesse.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <span className="text-3xl font-black text-brand-400/30">02</span>
            <h3 className="text-xl font-bold text-white">Pratique com Rigor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cronômetro de prova, atalhos de teclado ágeis e técnica de eliminação de alternativas absurdas na tela ou no papel.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <span className="text-3xl font-black text-brand-400/30">03</span>
            <h3 className="text-xl font-bold text-white">Diagnostique & Feche Gaps</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Veja seus erros comentados e clique em um único botão para refazer apenas as questões onde você falhou.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-900/80 via-slate-900 to-accent-950/80 border border-brand-500/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Pronto para treinar como se a prova fosse amanhã?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Comece em menos de 10 segundos. Sem cadastro, sem cartão, com salvamento local instantâneo.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => handleGoToApp()}
              className="shadow-glow text-base font-bold px-10"
            >
              Acessar Simulify Agora
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size="sm" showTagline />
        <div className="flex items-center gap-6">
          <span>Modo Offline Disponível</span>
          <span>•</span>
          <button onClick={() => handleGoToApp()} className="hover:text-slate-300 transition-colors">
            Painel do Aluno (app.simulify)
          </button>
        </div>
        <p>© 2026 Simulify. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
