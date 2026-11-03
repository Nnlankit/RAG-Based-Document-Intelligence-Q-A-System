import React, { useState } from 'react';
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
  CreditCard,
  CheckCircle2,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/analyticsService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface SidebarProps {
  onOpenUpload?: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenUpload, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

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
          'relative flex flex-col h-screen border-r border-[#2C2347] bg-[#211A35] text-[#E2DCF0] transition-all duration-300 z-30 select-none shadow-[4px_0_24px_rgba(23,21,43,0.18)]',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#2C2347]">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#5920B5] flex items-center justify-center text-white shadow-purple shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                  DocuMind <span className="text-[#8B5CF6]">AI</span>
                </span>
                <span className="text-[10px] text-[#8E85A6] font-semibold tracking-wider uppercase">
                  Document Intelligence
                </span>
              </div>
            )}
          </div>

          {/* Collapse toggle button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-[#8E85A6] hover:text-white hover:bg-[#2C2347] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Upload CTA */}
        <div className="p-3">
          {collapsed ? (
            <button
              onClick={onOpenUpload}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#5920B5] to-[#8B5CF6] hover:from-[#481A94] hover:to-[#7C3AED] text-white flex items-center justify-center shadow-purple transition-all active:scale-95"
              title="Upload Document"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onOpenUpload}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#5920B5] to-[#8B5CF6] hover:from-[#481A94] hover:to-[#7C3AED] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-purple transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
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
                      ? 'bg-[#5920B5] text-white font-semibold shadow-purple'
                      : 'text-[#A39EB8] hover:bg-[#2E2449] hover:text-white'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                        isActive ? 'text-white' : 'text-[#8E85A6] group-hover:text-[#C4B5FD]'
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {isActive && (
                      <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section: AI Workspace Card & Upgrade Button */}
        {!collapsed && (
          <div className="p-3 mx-3 mb-3 rounded-2xl bg-[#2A2242] border border-[#362C54] shadow-sm select-none">
            {/* Status & Model info */}
            <div
              onClick={() => navigate('/knowledge-base')}
              className="cursor-pointer group"
              title="Click to inspect knowledge base"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-[#5920B5] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                    <Zap className="w-3 h-3 text-[#DDD6FE]" />
                  </div>
                  <span className="text-xs font-semibold text-white group-hover:text-[#DDD6FE] transition-colors">
                    AI Workspace
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#34D399] bg-[#059669]/20 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>

              <p className="text-[11px] text-[#A39EB8] mb-2 leading-relaxed">
                Llama 3.2 Local & pgvector
              </p>

              {/* Storage Usage Indicator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#8E85A6]">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-[#A78BFA]" />
                    Storage
                  </span>
                  <span className="font-medium text-[#DDD6FE]">{storageMB} MB / 1 GB</span>
                </div>
                <div className="w-full bg-[#1A142B] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#8B5CF6] to-[#5920B5] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(storagePercent, 5)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Upgrade Plan button */}
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="w-full mt-2.5 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#5920B5]/60 to-[#8B5CF6]/60 hover:from-[#5920B5] hover:to-[#8B5CF6] border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        )}

        {/* Collapsed view simple indicator */}
        {collapsed && (
          <div
            onClick={() => setUpgradeModalOpen(true)}
            className="p-3 flex justify-center border-t border-[#2C2347] cursor-pointer hover:bg-[#2A2242] transition-colors"
            title={`Storage: ${storageMB} MB / 1 GB (Click to Upgrade Plan)`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#2A2242] text-[#A78BFA] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
          </div>
        )}
      </aside>

      {/* Upgrade Plan Modal */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="DocuMind AI — Upgrade Plan"
        description="Unlock higher vector storage, larger context sizes, and priority local inference."
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {/* Free Plan */}
            <div className="p-3.5 rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#17152B] dark:text-white">Community</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8E1F2] text-[#5920B5]">Current</span>
              </div>
              <p className="text-xl font-extrabold text-[#17152B] dark:text-white">$0 <span className="text-xs text-[#77738A] font-normal">/mo</span></p>
              <ul className="space-y-1.5 text-[11px] text-[#77738A] dark:text-[#A39EB8]">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> 1 GB Vector Storage</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Llama 3.2 (3B) Inference</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Single Workspace Isolation</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="p-3.5 rounded-2xl border-2 border-[#8B5CF6] bg-gradient-to-br from-white to-[#F0EBFA] dark:from-[#1E1733] dark:to-[#2A2047] space-y-2.5 shadow-purple relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#8B5CF6] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
                Recommended
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#5920B5] dark:text-[#C4B5FD]">Enterprise Pro</span>
              </div>
              <p className="text-xl font-extrabold text-[#17152B] dark:text-white">$29 <span className="text-xs text-[#77738A] font-normal">/mo</span></p>
              <ul className="space-y-1.5 text-[11px] text-[#17152B] dark:text-[#E2DCF0]">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#8B5CF6]" /> 50 GB Vector Storage</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#8B5CF6]" /> Multi-Model Routing (70B / Vision)</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#8B5CF6]" /> Dedicated Neon pgvector branch</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#8B5CF6]" /> Priority Streaming & Indexing</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E1F2] dark:border-[#352B52]">
            <Button variant="secondary" onClick={() => setUpgradeModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setUpgradeModalOpen(false);
                navigate('/profile');
              }}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Manage Subscription in Profile
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
