import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Plus,
  MessageSquare,
  User,
  Settings,
  BookOpen,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useChatSettings } from '../../context/ChatSettingsContext';
import { useQuery } from '@tanstack/react-query';
import { healthService } from '../../services/healthService';
import { analyticsService } from '../../services/analyticsService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
  onOpenCommandPalette,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const { scopeDocumentIds, clearScope } = useChatSettings();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: healthService.checkHealth,
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => analyticsService.getStats(),
  });

  const isHealthy = health?.status === 'healthy';

  const notifications = [
    {
      id: '1',
      title: 'Vector Store Synchronized',
      desc: `${stats?.overview?.total_chunks || 0} document chunks indexed in pgvector.`,
      time: 'Just now',
      type: 'success',
    },
    {
      id: '2',
      title: 'Local LLM Connected',
      desc: `Llama 3.2 is active and ready for streaming inference.`,
      time: '2m ago',
      type: 'info',
    },
    {
      id: '3',
      title: 'Neon PostgreSQL Linked',
      desc: 'Relational storage operational with pgvector extension.',
      time: '10m ago',
      type: 'info',
    },
  ];

  return (
    <>
      <header className="h-16 px-4 md:px-6 border-b border-[#E8E1F2] dark:border-[#352B52] bg-white/90 dark:bg-[#1E1733]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 transition-colors">
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#77738A] hover:text-[#17152B] hover:bg-[#F0EBFA] dark:text-[#A39EB8] dark:hover:bg-[#2A2047] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar */}
          <div
            onClick={onOpenCommandPalette}
            className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#F8F6FC] dark:bg-[#150F24] text-[#77738A] dark:text-[#A39EB8] hover:border-[#8B5CF6] dark:hover:border-[#8B5CF6] cursor-pointer transition-all shadow-xs group"
          >
            <Search className="w-4 h-4 text-[#77738A] group-hover:text-[#5920B5] dark:group-hover:text-[#A78BFA] transition-colors shrink-0" />
            <span className="text-xs font-normal truncate">
              Search documents, chats, and questions...
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-[#251D3E] border border-[#E8E1F2] dark:border-[#3E3065] text-[#5920B5] dark:text-[#C4B5FD] rounded shadow-xs ml-auto shrink-0">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Active Scope Badge (if filtering by specific documents) */}
          {scopeDocumentIds.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#2C214B] border border-[#DDD6FE] dark:border-[#3E3065] text-[#5920B5] dark:text-[#DDD6FE] text-xs font-medium">
              <Layers className="w-3.5 h-3.5" />
              <span>Scope: {scopeDocumentIds.length} doc{scopeDocumentIds.length > 1 ? 's' : ''}</span>
              <button
                onClick={clearScope}
                className="ml-1 hover:text-[#17152B] dark:hover:text-white font-bold"
                title="Reset scope"
              >
                ×
              </button>
            </div>
          )}

          {/* New Chat Button */}
          <button
            onClick={() => navigate('/chat')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5920B5] hover:bg-[#481A94] text-white text-xs font-semibold shadow-purple hover:shadow-purple-lg transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          {/* System Health Indicator */}
          <div
            onClick={() => navigate('/settings')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer hover:opacity-85 transition-opacity ${
              isHealthy
                ? 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0] dark:bg-[#143E24] dark:text-[#4ADE80] dark:border-[#1F5E36]'
                : 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] dark:bg-[#3D2C10] dark:text-[#FBBF24] dark:border-[#5C4215]'
            }`}
            title={isHealthy ? 'All Systems Online (Click to view settings)' : 'Service Alert (Click to view settings)'}
          >
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-[#16A34A] animate-pulse' : 'bg-[#D97706]'}`} />
            <span>{isHealthy ? 'All Systems Online' : 'Service Alert'}</span>
          </div>

          {/* Help Icon */}
          <button
            onClick={() => setHelpModalOpen(true)}
            className="p-2 rounded-xl text-[#77738A] hover:text-[#5920B5] hover:bg-[#F0EBFA] dark:text-[#A39EB8] dark:hover:text-[#FFFFFF] dark:hover:bg-[#2A2047] transition-colors"
            title="Help & Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-[#77738A] hover:text-[#5920B5] hover:bg-[#F0EBFA] dark:text-[#A39EB8] dark:hover:text-[#FFFFFF] dark:hover:bg-[#2A2047] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8B5CF6] ring-2 ring-white dark:ring-[#1E1733]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] shadow-purple-lg p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8E1F2] dark:border-[#352B52]">
                  <span className="text-xs font-bold text-[#17152B] dark:text-white">Activity Notifications</span>
                  <span className="text-[10px] text-[#8B5CF6] font-semibold cursor-pointer hover:underline">Mark read</span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-[#FAF8FD] dark:bg-[#160F25] text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#17152B] dark:text-[#F5F3FF]">{n.title}</span>
                        <span className="text-[10px] text-[#77738A]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8]">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#E8E1F2] dark:bg-[#352B52] mx-1" />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5920B5] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shadow-purple">
                AM
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#17152B] dark:text-white leading-tight">
                  Alex Morgan
                </span>
                <span className="text-[10px] text-[#77738A] dark:text-[#A39EB8]">
                  Senior AI Analyst
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#77738A] hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] shadow-purple-lg p-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#E8E1F2] dark:border-[#352B52] mb-1">
                  <p className="font-bold text-[#17152B] dark:text-white">Alex Morgan</p>
                  <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8] truncate">alex.morgan@documind.ai</p>
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#17152B] dark:text-[#F5F3FF] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#5920B5] dark:text-[#A78BFA]" />
                  <span>User Profile</span>
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#17152B] dark:text-[#F5F3FF] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#5920B5] dark:text-[#A78BFA]" />
                  <span>Preferences</span>
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setHelpModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#17152B] dark:text-[#F5F3FF] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#5920B5] dark:text-[#A78BFA]" />
                  <span>Documentation</span>
                </button>
                <div className="my-1 border-t border-[#E8E1F2] dark:border-[#352B52]" />
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#DC2626] hover:bg-[#FEE2E2] dark:hover:bg-[#3D1414] transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help & Shortcuts Modal */}
      <Modal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="DocuMind AI — Guide & Shortcuts"
        description="Quick keyboard shortcuts and document intelligence assistance."
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-[#17152B] dark:text-white uppercase tracking-wider text-[11px]">
              Keyboard Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#FAF8FD] dark:bg-[#18112A] border border-[#E8E1F2] dark:border-[#352B52] flex items-center justify-between">
                <span>Command Palette</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#241A3E] border rounded text-[10px] font-mono font-bold text-[#5920B5]">Ctrl + K</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FD] dark:bg-[#18112A] border border-[#E8E1F2] dark:border-[#352B52] flex items-center justify-between">
                <span>Send Chat Message</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#241A3E] border rounded text-[10px] font-mono font-bold text-[#5920B5]">Enter</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FD] dark:bg-[#18112A] border border-[#E8E1F2] dark:border-[#352B52] flex items-center justify-between">
                <span>New Line in Chat</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#241A3E] border rounded text-[10px] font-mono font-bold text-[#5920B5]">Shift + Enter</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8FD] dark:bg-[#18112A] border border-[#E8E1F2] dark:border-[#352B52] flex items-center justify-between">
                <span>Close Modals</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#241A3E] border rounded text-[10px] font-mono font-bold text-[#5920B5]">Esc</kbd>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] border border-[#D5C7EA] dark:border-[#433272] space-y-1.5">
            <h5 className="font-bold text-[#5920B5] dark:text-[#DDD6FE]">How DocuMind RAG Works</h5>
            <p className="text-[#77738A] dark:text-[#A39EB8] leading-relaxed">
              When you upload a document, it is automatically parsed, split into dense semantic chunks, and embedded via <span className="font-mono text-[#5920B5] dark:text-[#C4B5FD]">nomic-embed-text</span> into <span className="font-semibold text-[#17152B] dark:text-white">Neon pgvector</span>. Chat queries are answered strictly based on retrieved context with verified page citations.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setHelpModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
