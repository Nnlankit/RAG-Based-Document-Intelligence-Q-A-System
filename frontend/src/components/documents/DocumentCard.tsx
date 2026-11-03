import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Trash2,
  Star,
  ExternalLink,
  Layers,
  HardDrive,
  Calendar,
  Eye,
  Download,
} from 'lucide-react';
import { DocumentItem } from '../../types/document';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useChatSettings } from '../../context/ChatSettingsContext';
import { useToast } from '../common/Toast';
import { documentService } from '../../services/documentService';
import { useQueryClient } from '@tanstack/react-query';

interface DocumentCardProps {
  document: DocumentItem;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isFavorite, toggleFavorite, setScopeDocumentIds } = useChatSettings();
  const { success, error } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const starred = isFavorite(document.id);

  const getFormatBadge = (filename: string) => {
    const ext = filename.split('.').pop()?.toUpperCase() || 'DOC';
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F0EBFA] text-[#5920B5] dark:bg-[#2A2047] dark:text-[#C4B5FD] border border-[#E8E1F2] dark:border-[#3E3065]">
        {ext}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed' || status === 'indexed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] dark:bg-[#143E24] dark:text-[#4ADE80] dark:border-[#1F5E36]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          Indexed
        </span>
      );
    }
    if (status === 'processing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] dark:bg-[#3D2C10] dark:text-[#FBBF24]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
          Processing
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] dark:bg-[#3D1414] dark:text-[#F87171]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0EBFA] text-[#5920B5] border border-[#E8E1F2]">
        {status}
      </span>
    );
  };

  const handleStartChatWithDoc = () => {
    setScopeDocumentIds([document.id]);
    navigate('/chat');
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete document "${document.filename}" and its vector index?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await documentService.deleteDocument(document.id);
      success('Document Deleted', `"${document.filename}" was successfully removed.`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-stats'] });
    } catch (err: any) {
      error('Delete Failed', err.message || 'Could not delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  return (
    <Card
      hoverable
      onClick={() => navigate(`/documents/${document.id}`)}
      className="p-5 flex flex-col justify-between group cursor-pointer border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card hover:border-[#8B5CF6] transition-all"
    >
      <div>
        {/* Top row: Format badge & Favorite star */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getFormatBadge(document.filename)}
            {getStatusBadge(document.status)}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(document.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              starred
                ? 'text-amber-500 fill-current bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50'
                : 'text-[#77738A] hover:text-amber-500 hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047]'
            }`}
            title={starred ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${starred ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Filename with purple document icon */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#A78BFA] flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#17152B] dark:text-[#F5F3FF] line-clamp-1 group-hover:text-[#5920B5] dark:group-hover:text-[#A78BFA] transition-colors" title={document.filename}>
              {document.filename}
            </h3>
            <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8] truncate">
              {document.original_filename}
            </p>
          </div>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-2 gap-2 my-3 text-xs text-[#77738A] dark:text-[#A39EB8]">
          <div className="flex items-center gap-1.5 bg-[#FAF8FD] dark:bg-[#160F25] p-2 rounded-xl border border-[#E8E1F2] dark:border-[#352B52]">
            <Layers className="w-3.5 h-3.5 text-[#5920B5] dark:text-[#A78BFA]" />
            <span className="font-semibold text-[#17152B] dark:text-white">{document.chunk_count}</span>
            <span>chunks</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FAF8FD] dark:bg-[#160F25] p-2 rounded-xl border border-[#E8E1F2] dark:border-[#352B52]">
            <HardDrive className="w-3.5 h-3.5 text-[#8B5CF6] dark:text-[#A78BFA]" />
            <span>{formatFileSize(document.file_size)}</span>
          </div>
        </div>
      </div>

      {/* Card footer actions */}
      <div className="pt-3 border-t border-[#E8E1F2] dark:border-[#352B52] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#77738A]">
          {formatDate(document.created_at)}
        </span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleStartChatWithDoc}
            className="p-1.5 rounded-lg text-[#5920B5] hover:text-white hover:bg-[#5920B5] transition-colors"
            title="Ask AI about this document"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => documentService.downloadDocument(document.id, document.filename)}
            className="p-1.5 rounded-lg text-[#77738A] hover:text-[#17152B] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
            title="Download document"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-[#77738A] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};
