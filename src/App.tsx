import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/app/DashboardPage';
import { ExamConfigPage } from './pages/app/ExamConfigPage';
import { ExamVerifyPage } from './pages/app/ExamVerifyPage';
import { ExamPage } from './pages/app/ExamPage';
import { ResultPage } from './pages/app/ResultPage';
import { PrintExamPage } from './pages/app/PrintExamPage';
import { TrackerPage } from './pages/app/TrackerPage';
import { QuestionsPage } from './pages/app/QuestionsPage';
import { SimuladosPage } from './pages/app/SimuladosPage';
import { PerformancePage } from './pages/app/PerformancePage';
import { SettingsPage } from './pages/app/SettingsPage';
import { GuestPage } from './pages/app/GuestPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page (Separada da dashboard, pronta para subdomínio) */}
          <Route path="/" element={<LandingPage />} />

          {/* Aplicação / Dashboard (app.simulify) */}
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/guest" element={<GuestPage />} />
          <Route path="/app/simulados" element={<SimuladosPage />} />
          <Route path="/app/questoes" element={<QuestionsPage />} />
          <Route path="/app/desempenho" element={<PerformancePage />} />
          <Route path="/app/configuracoes" element={<SettingsPage />} />
          <Route path="/app/config/:id" element={<ExamConfigPage />} />
          <Route path="/app/verificar/:id" element={<ExamVerifyPage />} />
          <Route path="/app/simulado/:id" element={<ExamPage />} />
          <Route path="/app/resultado/:id" element={<ResultPage />} />
          <Route path="/app/imprimir/:id" element={<PrintExamPage />} />
          <Route path="/app/tracker/:id" element={<TrackerPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
