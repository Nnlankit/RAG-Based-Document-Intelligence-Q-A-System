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
  Database,
  History,
  Sparkles,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '../../services/documentService';
import { chatService } from '../../services/chatService';
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

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.listConversations(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const documents = docData?.documents || [];
  const conversations = convData || [];

  const filteredDocs = query
    ? documents.filter(
        (d) =>
          d.filename.toLowerCase().includes(query.toLowerCase()) ||
          d.original_filename?.toLowerCase().includes(query.toLowerCase())
      )
    : documents.slice(0, 3);

  const filteredConvs = query
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.messages?.some((m) => m.content.toLowerCase().includes(query.toLowerCase()))
      )
    : conversations.slice(0, 3);

  const hasMatches = filteredDocs.length > 0 || filteredConvs.length > 0;

  const handleSelect = (action: () => void) => {
    action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#202124]/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.12 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#202124] rounded-2xl shadow-dropdown border border-[#E9E1CC] dark:border-[#303238] overflow-hidden z-10"
        >
          {/* Search bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-[#E9E1CC] dark:border-[#303238]">
            <Search className="w-5 h-5 text-[#202124] dark:text-[#FFE89A] shrink-0 mr-3" />
            <input
              autoFocus
              type="text"
              placeholder="Search documents, past chats, navigate, or trigger actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[#202124] dark:text-[#FAF8F2] placeholder-[#77746B]/70 dark:placeholder-[#A99F87]/60 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 mr-2 text-[#77746B] hover:text-[#202124] dark:hover:text-white"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-[#202124] dark:text-[#FFE89A] bg-[#FFF9E8] dark:bg-[#17181A] rounded-md border border-[#E9E1CC] dark:border-[#303238] font-bold">
              ESC
            </kbd>
          </div>

          <div className="max-h-96 overflow-y-auto p-2 space-y-3">
            {/* Quick Actions (when query is empty or matches action) */}
            {(!query || 'upload new document start chat theme'.includes(query.toLowerCase())) && (
              <div>
                <p className="px-3 py-1 text-[10px] font-bold text-[#77746B] dark:text-[#A99F87] uppercase tracking-wider">
                  Quick Actions
                </p>
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() =>
                      handleSelect(() => {
                        onOpenUpload();
                      })
                    }
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-xl transition-colors text-left group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Plus className="w-4 h-4 text-[#202124] dark:text-[#FFE89A]" />
                      Upload new document
                    </span>
                    <span className="text-[10px] text-[#77746B]">Action</span>
                  </button>

                  <button
                    onClick={() => handleSelect(() => navigate('/chat'))}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-xl transition-colors text-left group"
                  >
                    <span className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-[#202124] dark:text-[#FFE89A]" />
                      Start new AI conversation
                    </span>
                    <span className="text-[10px] text-[#77746B]">Chat</span>
                  </button>

                  <button
                    onClick={() => handleSelect(toggleTheme)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-xl transition-colors text-left group"
                  >
                    <span className="flex items-center gap-2.5">
                      {actualTheme === 'dark' ? (
                        <Sun className="w-4 h-4 text-[#D99A24]" />
                      ) : (
                        <Moon className="w-4 h-4 text-[#202124]" />
                      )}
                      Toggle {actualTheme === 'dark' ? 'Light' : 'Dark'} mode
                    </span>
                    <span className="text-[10px] text-[#77746B]">Theme</span>
                  </button>
                </div>
              </div>
            )}

            {/* Documents */}
            {filteredDocs.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[10px] font-bold text-[#77746B] dark:text-[#A99F87] uppercase tracking-wider">
                  Documents ({filteredDocs.length})
                </p>
                <div className="mt-1 space-y-0.5">
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() =>
                        handleSelect(() => navigate(`/documents/${doc.id}`))
                      }
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-xl transition-colors text-left group"
                    >
                      <span className="flex items-center gap-2.5 truncate mr-2">
                        <FileText className="w-4 h-4 text-[#4D9B45] shrink-0" />
                        <span className="truncate group-hover:text-[#202124] dark:group-hover:text-[#FFE89A] font-medium">
                          {doc.filename}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-[#77746B] shrink-0">
                        {doc.chunk_count} chunks
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversations */}
            {filteredConvs.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[10px] font-bold text-[#77746B] dark:text-[#A99F87] uppercase tracking-wider">
                  Conversations ({filteredConvs.length})
                </p>
                <div className="mt-1 space-y-0.5">
                  {filteredConvs.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() =>
                        handleSelect(() => navigate(`/chat/${conv.id}`))
                      }
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-xl transition-colors text-left group"
                    >
                      <span className="flex items-center gap-2.5 truncate mr-2">
                        <History className="w-4 h-4 text-[#202124] dark:text-[#FFE89A] shrink-0" />
                        <span className="truncate group-hover:text-[#202124] dark:group-hover:text-[#FFE89A] font-medium">
                          {conv.title}
                        </span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#77746B] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty search state */}
            {query && !hasMatches && (
              <div className="p-8 text-center text-xs text-[#77746B] dark:text-[#A99F87] space-y-2">
                <Search className="w-8 h-8 text-[#202124] dark:text-[#FFE89A] mx-auto opacity-40" />
                <p className="font-semibold text-[#202124] dark:text-white">
                  No matching results for "{query}"
                </p>
                <p className="text-[11px]">Try searching for document names or conversation topics.</p>
              </div>
            )}

            {/* Navigation */}
            <div>
              <p className="px-3 py-1 text-[10px] font-bold text-[#77746B] dark:text-[#A99F87] uppercase tracking-wider">
                Navigation
              </p>
              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => handleSelect(() => navigate('/documents'))}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-xl transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#4D9B45]" />
                  All Documents
                </button>
                <button
                  onClick={() => handleSelect(() => navigate('/conversations'))}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-xl transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-[#D99A24]" />
                  Conversation History
                </button>
                <button
                  onClick={() => handleSelect(() => navigate('/analytics'))}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-xl transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#536C88]" />
                  Analytics & Observability
                </button>
                <button
                  onClick={() => handleSelect(() => navigate('/knowledge-base'))}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-xl transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-[#4D9B45]" />
                  Knowledge Base & Vectors
                </button>
                <button
                  onClick={() => handleSelect(() => navigate('/settings'))}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#202124] dark:text-[#FAF8F2] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-xl transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#77746B]" />
                  Settings & Sensitivity
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
