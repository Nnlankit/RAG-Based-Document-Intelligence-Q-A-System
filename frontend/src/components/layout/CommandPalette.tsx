import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FileText,
  MessageSquare,
  BarChart3,
  Star,
  Settings,
  Plus,
  Moon,
  Sun,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '../../services/documentService';
import { useTheme } from '../../context/ThemeContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenUpload,
}) => {
  const navigate = useNavigate();
  const { actualTheme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');

  const { data: docData } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.listDocuments(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const documents = docData?.documents || [];
  const filteredDocs = query
    ? documents.filter((d) =>
        d.filename.toLowerCase().includes(query.toLowerCase())
      )
    : documents.slice(0, 4);

  const handleSelect = (action: () => void) => {
    action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#30261E]/45 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.12 }}
          className="relative w-full max-w-xl bg-[#F7F0E3] dark:bg-[#2B231D] rounded-2xl shadow-[0_20px_60px_rgba(90,70,52,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-[#D4C3A5] dark:border-[#554638] overflow-hidden z-10"
        >
          {/* Search bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-[#D4C3A5]/60 dark:border-[#554638]/70">
            <Search className="w-5 h-5 text-[#8B6F52] dark:text-[#CDB795] shrink-0 mr-3" />
            <input
              autoFocus
              type="text"
              placeholder="Search documents, navigate, or trigger actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[#30261E] dark:text-[#F4EBDD] placeholder-[#6B5C4D]/80 dark:placeholder-[#B9A995]/80 focus:outline-none"
            />
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#5A4634] bg-[#E1D2B8] dark:bg-[#382D24] dark:text-[#E8DCC8] rounded border border-[#D4C3A5]/50 font-bold">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-4">
            {/* Quick Actions */}
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold text-[#8B6F52] dark:text-[#CDB795] uppercase tracking-wider">
                Quick Actions
              </p>
              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() =>
                    handleSelect(() => {
                      onOpenUpload();
                    })
                  }
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#30261E] dark:text-[#F4EBDD] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] rounded-xl transition-colors text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4 text-[#8B6F52] dark:text-[#CDB795]" />
                    Upload new document
                  </span>
                  <span className="text-xs text-[#5A4634] dark:text-[#DCC9AA]">Action</span>
                </button>

                <button
                  onClick={() => handleSelect(() => navigate('/chat'))}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#30261E] dark:text-[#F4EBDD] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] rounded-xl transition-colors text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-[#8B6F52] dark:text-[#CDB795]" />
                    Start new AI conversation
                  </span>
                  <span className="text-xs text-[#5A4634] dark:text-[#DCC9AA]">Chat</span>
                </button>

                <button
                  onClick={() => handleSelect(toggleTheme)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#30261E] dark:text-[#F4EBDD] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] rounded-xl transition-colors text-left"
                >
                  <span className="flex items-center gap-2.5">
                    {actualTheme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-[#8B6F52]" />
                    )}
                    Toggle {actualTheme === 'dark' ? 'Light' : 'Dark'} mode
                  </span>
                  <span className="text-xs text-[#5A4634] dark:text-[#DCC9AA]">Theme</span>
                </button>
              </div>
            </div>

            {/* Documents */}
            {filteredDocs.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[11px] font-semibold text-[#8B6F52] dark:text-[#CDB795] uppercase tracking-wider">
                  Documents
                </p>
                <div className="mt-1 space-y-0.5">
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() =>
                        handleSelect(() => navigate(`/documents/${doc.id}`))
                      }
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#30261E] dark:text-[#F4EBDD] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] rounded-xl transition-colors text-left"
                    >
                      <span className="flex items-center gap-2.5 truncate mr-2">
                        <FileText className="w-4 h-4 text-[#8B6F52] dark:text-[#CDB795] shrink-0" />
                        <span className="truncate">{doc.filename}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8B6F52] dark:text-[#CDB795] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold text-[#8B6F52] dark:text-[#CDB795] uppercase tracking-wider">
                Pages
              </p>
              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => handleSelect(() => navigate('/documents'))}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#30261E] dark:text-[#F4EBDD] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] rounded-xl transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#8B6F52] dark:text-[#CDB795]" />
                  All Documents
                </button>
                <button
                  onClick={() => handleSelect(() => navigate('/analytics'))}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#30261E] dark:text-[#F4EBDD] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] rounded-xl transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-[#8B6F52] dark:text-[#CDB795]" />
                  Analytics & Metrics
                </button>
                <button
                  onClick={() => handleSelect(() => navigate('/settings'))}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#30261E] dark:text-[#F4EBDD] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#8B6F52] dark:text-[#CDB795]" />
                  Settings & Models
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
