import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { ChatSettingsProvider } from './context/ChatSettingsContext';
import { ToastProvider } from './components/common/Toast';
import { AppShell } from './components/layout/AppShell';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { ChatPage } from './pages/ChatPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ChatSettingsProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="documents/:documentId" element={<DocumentDetailPage />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="chat/:conversationId" element={<ChatPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="favorites" element={<FavoritesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </ChatSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
