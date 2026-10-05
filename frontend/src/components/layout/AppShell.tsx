import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { CommandPalette } from './CommandPalette';
import { DocumentUploadModal } from '../documents/DocumentUploadModal';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Shortcut for Ctrl+K / Cmd+K to open Command Palette
  useKeyboardShortcut('k', () => setCommandPaletteOpen(true), true);

  return (
    <div className="flex h-screen bg-sand-gradient dark:bg-sand-dark-gradient text-[#30261E] dark:text-[#F4EBDD] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onOpenUpload={() => setUploadModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-[#30261E]/45 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#E2D3BB] dark:bg-[#261F1A] border-r border-[#D4C3A5] dark:border-[#554638] transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          collapsed={false}
          setCollapsed={() => {}}
          onOpenUpload={() => {
            setMobileMenuOpen(false);
            setUploadModalOpen(true);
          }}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-transparent">
          <Outlet />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenUpload={() => setUploadModalOpen(true)}
      />

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};
