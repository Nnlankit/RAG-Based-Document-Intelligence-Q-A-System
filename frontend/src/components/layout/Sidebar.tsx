import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  History,
  BarChart3,
  Star,
  Database,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  HardDrive,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/analyticsService';

interface SidebarProps {
  onOpenUpload?: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenUpload, collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => analyticsService.getStats(),
  });

  const totalStorageBytes = stats?.overview?.total_storage_bytes || 0;
  const storageLimitBytes = 1024 * 1024 * 1024; // 1 GB limit
  const storageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);
  const storagePercent = Math.min(Math.round((totalStorageBytes / storageLimitBytes) * 100), 100) || 4;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'AI Chat', path: '/chat', icon: MessageSquare },
    { label: 'Conversations', path: '/conversations', icon: History },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Favorites', path: '/favorites', icon: Star },
    { label: 'Knowledge Base', path: '/knowledge-base', icon: Database },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <aside
        className={clsx(
          'relative flex flex-col h-screen border-r border-[#303238] bg-[#202124] text-[#FFFFFF] transition-all duration-300 z-30 select-none shadow-[2px_0_12px_rgba(0,0,0,0.15)]',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#303238]">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFE89A] flex items-center justify-center text-[#202124] font-bold shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#202124]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  DocuMind <span className="text-[#FFE89A] font-semibold">AI</span>
                </span>
                <span className="text-[10px] text-[#A4A7AD] font-medium tracking-wider uppercase">
                  Document Intelligence
                </span>
              </div>
            )}
          </div>

          {/* Collapse toggle button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-[#A4A7AD] hover:text-white hover:bg-[#303238] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Upload CTA - Yellow with Dark Charcoal Text */}
        <div className="p-3">
          {collapsed ? (
            <button
              onClick={onOpenUpload}
              className="w-full h-11 rounded-xl bg-[#FFE89A] hover:bg-[#F5D670] text-[#202124] flex items-center justify-center shadow-xs transition-all active:scale-95 font-semibold"
              title="Upload Document"
            >
              <Plus className="w-5 h-5 text-[#202124]" />
            </button>
          ) : (
            <button
              onClick={onOpenUpload}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FFE89A] hover:bg-[#F5D670] text-[#202124] font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#202124]" />
              <span>Upload Document</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
                    isActive
                      ? 'bg-[#303238] text-[#FFFFFF] font-semibold'
                      : 'text-[#E6E7E8] hover:bg-[#303238]/70 hover:text-white'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                        isActive ? 'text-[#FFE89A]' : 'text-[#A4A7AD] group-hover:text-white'
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {isActive && (
                      <span className="absolute right-2.5 w-2 h-2 rounded-full bg-[#FFE89A]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section: AI Workspace Card & Upgrade Button */}
        {!collapsed && (
          <div className="p-3 mx-3 mb-3 rounded-2xl bg-[#2A2B2E] border border-[#303238] shadow-sm select-none">
            {/* Status & Model info */}
            <div
              onClick={() => navigate('/knowledge-base')}
              className="cursor-pointer group"
              title="Click to inspect knowledge base"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-[#303238] flex items-center justify-center text-[#FFE89A] group-hover:scale-105 transition-transform">
                    <Zap className="w-3 h-3 text-[#FFE89A]" />
                  </div>
                  <span className="text-xs font-semibold text-white group-hover:text-[#FFE89A] transition-colors">
                    AI Workspace
                  </span>
                </div>
                {/* Soft green status indicator */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#245B32] bg-[#DDF2C1] px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>

              <p className="text-[11px] text-[#A4A7AD] mb-2 leading-relaxed">
                Llama 3.2 Local & pgvector
              </p>

              {/* Storage Usage Indicator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#A4A7AD]">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-[#FFE89A]" />
                    Storage
                  </span>
                  <span className="font-medium text-white">{storageMB} MB / 1 GB</span>
                </div>
                <div className="w-full bg-[#17181A] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#DDF2C1] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(storagePercent, 5)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed view simple indicator */}
        {collapsed && (
          <div
            className="p-3 flex justify-center border-t border-[#303238]"
            title={`Storage: ${storageMB} MB / 1 GB`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#2A2B2E] text-[#FFE89A] flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-[#FFE89A]" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
