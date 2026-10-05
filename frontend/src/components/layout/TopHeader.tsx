import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useChatSettings } from '../../context/ChatSettingsContext';
import { useQuery } from '@tanstack/react-query';
import { healthService } from '../../services/healthService';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
  onOpenCommandPalette,
}) => {
  const location = useLocation();
  const { actualTheme, toggleTheme } = useTheme();
  const { scopeDocumentIds, clearScope } = useChatSettings();

  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: healthService.checkHealth,
    refetchInterval: 30000,
  });

  // Breadcrumbs calculation
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'DocuMind', path: '/' },
    ...pathParts.map((part, index) => {
      const url = `/${pathParts.slice(0, index + 1).join('/')}`;
      const name =
        part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      return { name, path: url };
    }),
  ];

  const isHealthy = health?.status === 'healthy';

  return (
    <header className="h-16 px-6 border-b border-[#D4C3A5] dark:border-[#554638] bg-[#F7F0E3]/75 dark:bg-[#2B231D]/85 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-[#5A4634] hover:text-[#211B16] hover:bg-[#E9DDC8] dark:text-[#DCC9AA] dark:hover:bg-[#342A22] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs font-medium text-[#5A4634] dark:text-[#DCC9AA]">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.path}>
              {idx > 0 && <span className="text-[#8B6F52]/60 dark:text-[#A89A89]">/</span>}
              <Link
                to={crumb.path}
                className={
                  idx === breadcrumbs.length - 1
                    ? 'text-[#30261E] dark:text-[#F4EBDD] font-semibold'
                    : 'hover:text-[#211B16] dark:hover:text-[#F4EBDD] transition-colors'
                }
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Search, Scope indicator, Health, Theme */}
      <div className="flex items-center gap-3">
        {/* Knowledge Scope Badge */}
        {scopeDocumentIds.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#CDB795]/35 dark:bg-[#44362A] border border-[#D4C3A5] dark:border-[#554638] text-[#5A4634] dark:text-[#F4EBDD] text-xs font-medium">
            <Layers className="w-3.5 h-3.5 text-[#8B6F52] dark:text-[#CDB795]" />
            <span>Scope: {scopeDocumentIds.length} doc{scopeDocumentIds.length > 1 ? 's' : ''}</span>
            <button
              onClick={clearScope}
              className="ml-1 hover:text-[#30261E] dark:hover:text-white text-xs font-bold"
              title="Reset to All Documents"
            >
              ×
            </button>
          </div>
        )}

        {/* Global Search Shortcut */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D4C3A5] dark:border-[#554638] bg-[#EEE3D0]/60 dark:bg-[#342A22] text-[#5A4634] dark:text-[#DCC9AA] hover:text-[#211B16] dark:hover:text-[#F4EBDD] hover:border-[#8B6F52] dark:hover:border-[#CDB795] transition-colors text-xs font-medium"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search & Actions</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#F7F0E3] dark:bg-[#2B231D] border border-[#D4C3A5] dark:border-[#554638] text-[#5A4634] dark:text-[#E5D5BA] rounded shadow-xs font-bold">
            Ctrl K
          </kbd>
        </button>

        {/* System Health Pill */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
            isHealthy
              ? 'bg-[#657A58]/15 text-[#4E6242] dark:bg-[#657A58]/25 dark:text-[#A7BA9B] border-[#657A58]/30 dark:border-[#657A58]/40'
              : 'bg-[#B38A4A]/15 text-[#8F6A2C] dark:bg-[#B38A4A]/25 dark:text-[#E2BD7E] border-[#B38A4A]/30 dark:border-[#B38A4A]/40'
          }`}
          title={isHealthy ? 'Backend & Ollama Online' : 'System Degraded'}
        >
          {isHealthy ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#657A58]" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-[#B38A4A]" />
          )}
          <span>{isHealthy ? 'Llama 3.2 Online' : 'System Check'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F4EBDD] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] transition-colors"
          title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {actualTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#D4AA64]" />
          ) : (
            <Moon className="w-4 h-4 text-[#5A4634]" />
          )}
        </button>
      </div>
    </header>
  );
};
