import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Trash2,
  Star,
  Eye,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react';
import { DocumentItem } from '../../types/document';
import { Button } from '../common/Button';
import { useChatSettings } from '../../context/ChatSettingsContext';
import { useToast } from '../common/Toast';
import { documentService } from '../../services/documentService';
import { useQueryClient } from '@tanstack/react-query';

interface DocumentTableProps {
  documents: DocumentItem[];
  enableSearch?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  compact?: boolean;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  enableSearch = true,
  enablePagination = true,
  pageSize = 5,
  compact = false,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isFavorite, toggleFavorite, setScopeDocumentIds } = useChatSettings();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'filename' | 'chunk_count' | 'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close 3-dot dropdown on outside click
  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const getFormatIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return (
        <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-[10px] border border-red-200 dark:border-red-900/60 shrink-0">
          PDF
        </span>
      );
    }
    if (ext === 'docx') {
      return (
        <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] border border-blue-200 dark:border-blue-900/60 shrink-0">
          DOCX
        </span>
      );
    }
    if (ext === 'txt') {
      return (
        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] border border-slate-200 dark:border-slate-700 shrink-0">
          TXT
        </span>
      );
    }
    if (ext === 'md') {
      return (
        <span className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[10px] border border-purple-200 dark:border-purple-900/60 shrink-0">
          MD
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-lg bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#C4B5FD] flex items-center justify-center font-bold text-[10px] border border-[#E8E1F2] dark:border-[#3E3065] shrink-0">
        FILE
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed' || status === 'indexed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] dark:bg-[#143E24] dark:text-[#4ADE80] dark:border-[#1F5E36]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          Indexed
        </span>
      );
    }
    if (status === 'processing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] dark:bg-[#3D2C10] dark:text-[#FBBF24] dark:border-[#5C4215]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
          Processing
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] dark:bg-[#3D1414] dark:text-[#F87171] dark:border-[#5E1E1E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0EBFA] text-[#5920B5] border border-[#E8E1F2]">
        {status}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleDelete = async (e: React.MouseEvent, doc: DocumentItem) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${doc.filename}" and its vector indices?`)) return;

    try {
      await documentService.deleteDocument(doc.id);
      success('Document Deleted', `"${doc.filename}" was successfully removed.`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-stats'] });
    } catch (err: any) {
      error('Delete Failed', err.message || 'Could not delete document');
    }
  };

  // Sorting and filtering
  const filteredAndSorted = useMemo(() => {
    let list = [...documents];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (d) =>
          d.filename.toLowerCase().includes(q) ||
          d.original_filename?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'filename') {
        cmp = a.filename.localeCompare(b.filename);
      } else if (sortField === 'chunk_count') {
        cmp = (a.chunk_count || 0) - (b.chunk_count || 0);
      } else {
        const da = new Date(a.created_at).getTime() || 0;
        const db = new Date(b.created_at).getTime() || 0;
        cmp = da - db;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [documents, searchTerm, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedDocs = enablePagination
    ? filteredAndSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredAndSorted;

  const toggleSort = (field: 'filename' | 'chunk_count' | 'created_at') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Header (if enabled) */}
      {enableSearch && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#77738A] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search table by document name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] text-[#17152B] dark:text-[#F5F3FF] placeholder-[#77738A]/70 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
            />
          </div>
          <span className="text-xs text-[#77738A] dark:text-[#A39EB8]">
            Showing {filteredAndSorted.length} of {documents.length} records
          </span>
        </div>
      )}

      {/* Table Container */}
      <div className="w-full overflow-x-auto border border-[#E8E1F2] dark:border-[#352B52] rounded-2xl bg-white dark:bg-[#1E1733] shadow-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8FD] dark:bg-[#150F24] text-[#77738A] dark:text-[#A39EB8] font-bold border-b border-[#E8E1F2] dark:border-[#352B52] uppercase tracking-wider">
            <tr>
              <th className={`${compact ? 'py-2 px-3' : 'py-3 px-4'} w-10 text-center`}>Fav</th>
              <th
                className={`${compact ? 'py-2 px-3' : 'py-3 px-4'} cursor-pointer hover:text-[#5920B5] transition-colors`}
                onClick={() => toggleSort('filename')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Document Name</span>
                  {sortField === 'filename' &&
                    (sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#5920B5]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#5920B5]" />)}
                </div>
              </th>
              <th
                className={`${compact ? 'py-2 px-3' : 'py-3 px-4'} cursor-pointer hover:text-[#5920B5] transition-colors`}
                onClick={() => toggleSort('chunk_count')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Chunks</span>
                  {sortField === 'chunk_count' &&
                    (sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#5920B5]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#5920B5]" />)}
                </div>
              </th>
              <th className={`${compact ? 'py-2 px-3' : 'py-3 px-4'}`}>Status</th>
              <th
                className={`${compact ? 'py-2 px-3' : 'py-3 px-4'} cursor-pointer hover:text-[#5920B5] transition-colors`}
                onClick={() => toggleSort('created_at')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Uploaded At</span>
                  {sortField === 'created_at' &&
                    (sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#5920B5]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#5920B5]" />)}
                </div>
              </th>
              <th className={`${compact ? 'py-2 px-3' : 'py-3 px-4'} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E1F2] dark:divide-[#352B52]">
            {paginatedDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#77738A]">
                  No documents found.
                </td>
              </tr>
            ) : (
              paginatedDocs.map((doc) => {
                const starred = isFavorite(doc.id);
                const isMenuOpen = activeMenuId === doc.id;

                return (
                  <tr
                    key={doc.id}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="hover:bg-[#FAF8FD] dark:hover:bg-[#1A132C] cursor-pointer transition-colors group"
                  >
                    {/* Favorite star */}
                    <td className={`${compact ? 'py-2 px-3' : 'py-3.5 px-4'} text-center`} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFavorite(doc.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          starred
                            ? 'text-amber-500 fill-current'
                            : 'text-[#77738A] hover:text-amber-500 hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047]'
                        }`}
                        title={starred ? 'Starred' : 'Star document'}
                      >
                        <Star className={`w-3.5 h-3.5 ${starred ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    {/* Document Name with File Type Icon */}
                    <td className={`${compact ? 'py-2 px-3' : 'py-3.5 px-4'} font-semibold text-[#17152B] dark:text-[#F5F3FF] max-w-xs truncate`}>
                      <div className="flex items-center gap-2.5">
                        {getFormatIcon(doc.filename)}
                        <div className="truncate">
                          <p className="truncate group-hover:text-[#5920B5] dark:group-hover:text-[#A78BFA] transition-colors text-xs font-bold" title={doc.filename}>
                            {doc.filename}
                          </p>
                          <p className="text-[10px] text-[#77738A] font-normal truncate">
                            {(doc.file_size / (1024 * 1024)).toFixed(2)} MB • {doc.original_filename}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Chunks */}
                    <td className={`${compact ? 'py-2 px-3 text-[11px]' : 'py-3.5 px-4'} font-mono font-bold text-[#5920B5] dark:text-[#A78BFA]`}>
                      {doc.chunk_count} chunks
                    </td>

                    {/* Status */}
                    <td className={`${compact ? 'py-2 px-3' : 'py-3.5 px-4'}`}>{getStatusBadge(doc.status)}</td>

                    {/* Uploaded At */}
                    <td className={`${compact ? 'py-2 px-3 text-[11px]' : 'py-3.5 px-4'} text-[#77738A] dark:text-[#A39EB8]`}>
                      {formatDate(doc.created_at)}
                    </td>

                    {/* Actions & 3-Dot Dropdown */}
                    <td className={`${compact ? 'py-2 px-3' : 'py-3.5 px-4'} text-right`} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 relative">
                        {/* Ask AI Shortcut */}
                        <button
                          onClick={() => {
                            setScopeDocumentIds([doc.id]);
                            navigate('/chat');
                          }}
                          className="p-1.5 text-[#5920B5] hover:text-white hover:bg-[#5920B5] rounded-lg transition-colors"
                          title="Ask AI about this document"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Three-Dot Menu Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : doc.id);
                          }}
                          className="p-1.5 text-[#77738A] hover:text-[#17152B] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] rounded-lg transition-colors"
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Three-Dot Menu Dropdown */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 w-44 bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] shadow-purple-lg rounded-xl py-1.5 z-40 text-left"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/documents/${doc.id}`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#17152B] dark:text-[#F5F3FF] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#5920B5]" />
                              <span>Open Document</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/documents/${doc.id}`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#17152B] dark:text-[#F5F3FF] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                            >
                              <Info className="w-3.5 h-3.5 text-[#8B5CF6]" />
                              <span>View Details</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                documentService.downloadDocument(doc.id, doc.filename);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#17152B] dark:text-[#F5F3FF] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-[#77738A]" />
                              <span>Download Original</span>
                            </button>

                            <div className="my-1 border-t border-[#E8E1F2] dark:border-[#352B52]" />

                            <button
                              onClick={(e) => {
                                setActiveMenuId(null);
                                handleDelete(e, doc);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Document</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {enablePagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24]">
            <span className="text-xs text-[#77738A]">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] text-[#77738A] hover:text-[#5920B5] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] text-[#77738A] hover:text-[#5920B5] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
