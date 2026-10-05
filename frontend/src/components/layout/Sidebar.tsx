import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BarChart3,
  Star,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Database,
  Cpu,
  UserCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../common/Button';

interface SidebarProps {
  onOpenUpload?: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenUpload, collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'AI Chat', path: '/chat', icon: MessageSquare },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Favorites', path: '/favorites', icon: Star },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={clsx(
        'relative flex flex-col h-screen border-r border-[#D4C3A5] dark:border-[#554638] bg-[#E2D3BB] dark:bg-[#261F1A] transition-all duration-300 z-30 select-none shadow-[2px_0_12px_rgba(90,70,52,0.04)]',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#D4C3A5]/80 dark:border-[#554638]">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-[#5A4634] dark:bg-[#E5D5BA] flex items-center justify-center text-[#F7F0E3] dark:text-[#211B16] shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-base font-bold tracking-tight text-[#30261E] dark:text-[#F4EBDD]">
                DocuMind <span className="text-[#B87952]">AI</span>
              </span>
              <span className="text-[10px] text-[#5A4634] dark:text-[#DCC9AA] font-semibold tracking-wide uppercase">
                Document Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F4EBDD] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        {collapsed ? (
          <Button
            variant="primary"
            size="icon"
            onClick={onOpenUpload}
            className="w-full h-11 rounded-xl bg-[#5A4634] hover:bg-[#463526] text-[#F7F0E3] dark:bg-[#E5D5BA] dark:hover:bg-[#D4C3A5] dark:text-[#211B16]"
            title="Upload Document"
          >
            <Plus className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onOpenUpload}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full justify-start rounded-xl font-medium shadow-sm py-2.5 bg-[#5A4634] hover:bg-[#463526] text-[#F7F0E3] dark:bg-[#E5D5BA] dark:hover:bg-[#D4C3A5] dark:text-[#211B16]"
          >
            Upload Document
          </Button>
        )}
      </div>

      {/* Navigation items */}
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-[#CDB795] text-[#30261E] dark:bg-[#44362A] dark:text-[#F4EBDD] font-semibold shadow-xs'
                    : 'text-[#5A4634] dark:text-[#DCC9AA] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] hover:text-[#211B16] dark:hover:text-[#F4EBDD]'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={clsx(
                      'w-5 h-5 shrink-0 transition-transform group-hover:scale-105',
                      isActive ? 'text-[#5A4634] dark:text-[#E5D5BA]' : 'text-[#5A4634] dark:text-[#DCC9AA]'
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Model & DB Status Section */}
      {!collapsed && (
        <div className="mx-3 my-2 p-3 rounded-xl bg-[#EEE3D0]/70 dark:bg-[#342A22] border border-[#D4C3A5] dark:border-[#554638] text-xs space-y-2">
          <div className="flex items-center justify-between text-[#5A4634] dark:text-[#DCC9AA]">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-[#8B6F52] dark:text-[#CDB795]" />
              Model
            </span>
            <span className="font-mono text-[#30261E] dark:text-[#F4EBDD] font-medium">Llama 3.2</span>
          </div>
          <div className="flex items-center justify-between text-[#5A4634] dark:text-[#DCC9AA]">
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-[#657A58]" />
              Vector DB
            </span>
            <span className="font-mono text-[#30261E] dark:text-[#F4EBDD] font-medium">ChromaDB</span>
          </div>
        </div>
      )}

      {/* User Footer */}
      <div className="p-3 border-t border-[#D4C3A5]/80 dark:border-[#554638]">
        <div
          className={clsx(
            'flex items-center gap-3 p-2 rounded-xl hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[#CDB795] text-[#30261E] dark:bg-[#44362A] dark:text-[#F4EBDD] flex items-center justify-center font-semibold text-xs shrink-0 border border-[#B9A587] dark:border-[#5A4634]">
            DU
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-[#30261E] dark:text-[#F4EBDD] truncate">
                Default Workspace
              </span>
              <span className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA] font-medium truncate">Local Mode</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
