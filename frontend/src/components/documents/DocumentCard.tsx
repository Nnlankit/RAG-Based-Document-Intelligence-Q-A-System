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
    if (ext === 'PDF') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#202124] text-white border border-[#303238]">
          PDF
        </span>
      );
    }
    if (ext === 'DOCX') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1]">
          DOCX
        </span>
      );
    }
    if (ext === 'TXT') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FFF1CC] text-[#D99A24] border border-[#FFE89A]">
          TXT
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1]">
        {ext}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed' || status === 'indexed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4D9B45]" />
          Indexed
        </span>
      );
    }
    if (status === 'processing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF1CC] text-[#D99A24] border border-[#FFE89A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
          Processing
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FCE8E8] text-[#C94B4B] border border-[#FAD2D2]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C94B4B]" />
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF9E8] text-[#202124] border border-[#E9E1CC]">
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
      className="p-5 flex flex-col justify-between group cursor-pointer border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card hover:border-[#E8BD42] transition-all"
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
                ? 'text-amber-500 fill-current bg-[#FFF1CC] border border-[#FFE89A]'
                : 'text-[#77746B] hover:text-amber-500 hover:bg-[#FFF9E8] dark:hover:bg-[#303238]'
            }`}
            title={starred ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${starred ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Filename with document icon */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFF9E8] dark:bg-[#303238] text-[#202124] dark:text-[#FFE89A] flex items-center justify-center shrink-0 mt-0.5 border border-[#E9E1CC] dark:border-[#484A50]">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#202124] dark:text-[#FFFDF5] line-clamp-1 group-hover:text-[#4D9B45] transition-colors" title={document.filename}>
              {document.filename}
            </h3>
            <p className="text-[11px] text-[#77746B] dark:text-[#A8A499] truncate">
              {document.original_filename}
            </p>
          </div>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-2 gap-2 my-3 text-xs text-[#77746B] dark:text-[#A8A499]">
          <div className="flex items-center gap-1.5 bg-[#FFFDF5] dark:bg-[#1A1A1C] p-2 rounded-xl border border-[#E9E1CC] dark:border-[#303238]">
            <Layers className="w-3.5 h-3.5 text-[#245B32] dark:text-[#DDF2C1]" />
            <span className="font-semibold text-[#202124] dark:text-white">{document.chunk_count}</span>
            <span>chunks</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FFFDF5] dark:bg-[#1A1A1C] p-2 rounded-xl border border-[#E9E1CC] dark:border-[#303238]">
            <HardDrive className="w-3.5 h-3.5 text-[#E8BD42]" />
            <span>{formatFileSize(document.file_size)}</span>
          </div>
        </div>
      </div>

      {/* Card footer actions */}
      <div className="pt-3 border-t border-[#E9E1CC] dark:border-[#303238] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#77746B] dark:text-[#A8A499]">
          {formatDate(document.created_at)}
        </span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleStartChatWithDoc}
            className="p-1.5 rounded-lg text-[#202124] hover:text-[#FFE89A] hover:bg-[#202124] transition-colors"
            title="Ask AI about this document"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => documentService.downloadDocument(document.id, document.filename)}
            className="p-1.5 rounded-lg text-[#77746B] hover:text-[#202124] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] transition-colors"
            title="Download document"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-[#77746B] hover:text-[#C94B4B] hover:bg-[#FCE8E8] dark:hover:bg-[#3D1414] transition-colors"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};
