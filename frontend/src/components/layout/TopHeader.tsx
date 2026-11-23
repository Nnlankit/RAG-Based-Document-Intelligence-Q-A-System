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
      <header className="h-16 px-4 md:px-6 border-b border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5]/95 dark:bg-[#202124]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 transition-colors">
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#77746B] hover:text-[#202124] hover:bg-[#FFE89A]/30 dark:text-[#A99F87] dark:hover:bg-[#303238] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar with Pale Cream Background */}
          <div
            onClick={onOpenCommandPalette}
            className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A] text-[#77746B] dark:text-[#A99F87] hover:border-[#FFE89A] dark:hover:border-[#FFE89A] cursor-pointer transition-all shadow-xs group"
          >
            <Search className="w-4 h-4 text-[#77746B] group-hover:text-[#202124] dark:group-hover:text-[#FFE89A] transition-colors shrink-0" />
            <span className="text-xs font-normal truncate">
              Search documents, chats, and questions...
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] text-[#202124] dark:text-[#FFE89A] rounded shadow-xs ml-auto shrink-0">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Active Scope Badge */}
          {scopeDocumentIds.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E5F4DC] dark:bg-[#1B4526] border border-[#C2E599] dark:border-[#3D8036] text-[#245B32] dark:text-[#DDF2C1] text-xs font-medium">
              <Layers className="w-3.5 h-3.5" />
              <span>Scope: {scopeDocumentIds.length} doc{scopeDocumentIds.length > 1 ? 's' : ''}</span>
              <button
                onClick={clearScope}
                className="ml-1 hover:text-[#202124] dark:hover:text-white font-bold"
                title="Reset scope"
              >
                ×
              </button>
            </div>
          )}

          {/* Charcoal Primary Action Button */}
          <button
            onClick={() => navigate('/chat')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#202124] hover:bg-[#303238] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#FFE89A]" />
            <span>New Chat</span>
          </button>

          {/* Light Green System Health Status Indicator */}
          <div
            onClick={() => navigate('/settings')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer hover:opacity-85 transition-opacity ${
              isHealthy
                ? 'bg-[#E5F4DC] text-[#245B32] border-[#C2E599] dark:bg-[#1B4526] dark:text-[#DDF2C1] dark:border-[#3D8036]'
                : 'bg-[#FFF1CC] text-[#D99A24] border-[#FFE89A] dark:bg-[#5E3E08] dark:text-[#FFE89A] dark:border-[#875C0F]'
            }`}
            title={isHealthy ? 'All Systems Online (Click to view settings)' : 'Service Alert (Click to view settings)'}
          >
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-[#4D9B45] animate-pulse' : 'bg-[#D99A24]'}`} />
            <span>{isHealthy ? 'All Systems Online' : 'Service Alert'}</span>
          </div>

          {/* Help Icon */}
          <button
            onClick={() => setHelpModalOpen(true)}
            className="p-2 rounded-xl text-[#77746B] hover:text-[#202124] hover:bg-[#FFE89A]/20 dark:text-[#A99F87] dark:hover:text-[#FFFFFF] dark:hover:bg-[#303238] transition-colors"
            title="Help & Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown with Yellow Notification Highlight */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-[#77746B] hover:text-[#202124] hover:bg-[#FFE89A]/20 dark:text-[#A99F87] dark:hover:text-[#FFFFFF] dark:hover:bg-[#303238] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FFE89A] ring-2 ring-white dark:ring-[#202124]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] shadow-dropdown p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E9E1CC] dark:border-[#303238]">
                  <span className="text-xs font-bold text-[#202124] dark:text-white">Activity Notifications</span>
                  <span className="text-[10px] text-[#245B32] dark:text-[#DDF2C1] font-semibold cursor-pointer hover:underline">Mark read</span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC]/60 dark:border-[#303238] text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#202124] dark:text-[#FAF8F2]">{n.title}</span>
                        <span className="text-[10px] text-[#77746B]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#77746B] dark:text-[#A99F87]">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#E9E1CC] dark:bg-[#303238] mx-1" />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#FFE89A]/20 dark:hover:bg-[#303238] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#FFE89A] text-[#202124] flex items-center justify-center font-bold text-xs shadow-xs">
                AM
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#202124] dark:text-white leading-tight">
                  Alex Morgan
                </span>
                <span className="text-[10px] text-[#77746B] dark:text-[#A99F87]">
                  Senior AI Analyst
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#77746B] hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] shadow-dropdown p-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#E9E1CC] dark:border-[#303238] mb-1">
                  <p className="font-bold text-[#202124] dark:text-white">Alex Morgan</p>
                  <p className="text-[11px] text-[#77746B] dark:text-[#A99F87] truncate">alex.morgan@documind.ai</p>
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFE89A]/30 dark:hover:bg-[#303238] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#202124] dark:text-[#FFE89A]" />
                  <span>User Profile</span>
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFE89A]/30 dark:hover:bg-[#303238] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#202124] dark:text-[#FFE89A]" />
                  <span>Preferences</span>
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setHelpModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFE89A]/30 dark:hover:bg-[#303238] transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#202124] dark:text-[#FFE89A]" />
                  <span>Documentation</span>
                </button>
                <div className="my-1 border-t border-[#E9E1CC] dark:border-[#303238]" />
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#C94B4B] hover:bg-[#FCE8E8] dark:hover:bg-[#5C1D1D] transition-colors font-medium"
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
            <h4 className="font-bold text-[#202124] dark:text-white uppercase tracking-wider text-[11px]">
              Keyboard Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] flex items-center justify-between">
                <span className="text-[#202124] dark:text-[#FAF8F2]">Command Palette</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] rounded text-[10px] font-mono font-bold text-[#202124] dark:text-[#FFE89A]">Ctrl + K</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] flex items-center justify-between">
                <span className="text-[#202124] dark:text-[#FAF8F2]">Send Chat Message</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] rounded text-[10px] font-mono font-bold text-[#202124] dark:text-[#FFE89A]">Enter</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] flex items-center justify-between">
                <span className="text-[#202124] dark:text-[#FAF8F2]">New Line in Chat</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] rounded text-[10px] font-mono font-bold text-[#202124] dark:text-[#FFE89A]">Shift + Enter</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] flex items-center justify-between">
                <span className="text-[#202124] dark:text-[#FAF8F2]">Close Modals</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] rounded text-[10px] font-mono font-bold text-[#202124] dark:text-[#FFE89A]">Esc</kbd>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#E5F4DC] dark:bg-[#1B4526] border border-[#C2E599] dark:border-[#3D8036] space-y-1.5">
            <h5 className="font-bold text-[#245B32] dark:text-[#DDF2C1]">How DocuMind RAG Works</h5>
            <p className="text-[#303238] dark:text-[#FAF8F2] leading-relaxed">
              When you upload a document, it is automatically parsed, split into dense semantic chunks, and embedded via <span className="font-mono text-[#245B32] dark:text-[#DDF2C1]">nomic-embed-text</span> into <span className="font-semibold text-[#202124] dark:text-white">Neon pgvector</span>. Chat queries are answered strictly based on retrieved context with verified page citations.
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
