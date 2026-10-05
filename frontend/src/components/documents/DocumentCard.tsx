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
import { Badge } from '../common/Badge';
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
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E1D2B8] text-[#5A4634] dark:bg-[#3E3228] dark:text-[#E8DCC8] border border-[#CDBB9D] dark:border-[#5A4634]">
        {ext}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#657A58]/15 text-[#657A58] dark:text-[#88A676] border border-[#657A58]/30">
          Indexed
        </span>
      );
    }
    if (status === 'processing') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#B38A4A]/15 text-[#B38A4A] border border-[#B38A4A]/30">
          Processing
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#A65D50]/15 text-[#A65D50] border border-[#A65D50]/30">
          Failed
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#9A8B78]/15 text-[#5A4634] dark:text-[#DCC9AA] border border-[#9A8B78]/30">
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
      className="p-5 flex flex-col justify-between group cursor-pointer border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] shadow-card hover:border-[#8B6F52] dark:hover:border-[#8B6F52] transition-all"
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
                ? 'text-[#B38A4A] bg-[#B38A4A]/15 border border-[#B38A4A]/30'
                : 'text-[#6B5C4D] dark:text-[#B9A995] hover:text-[#5A4634] dark:hover:text-[#F7F0E3] hover:bg-[#E1D2B8]/40 dark:hover:bg-[#3E3228]'
            }`}
            title={starred ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${starred ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Filename with brown document icon */}
        <div className="flex items-start gap-2 mb-2">
          <FileText className="w-4 h-4 text-[#8B6F52] shrink-0 mt-0.5" />
          <h3 className="text-sm font-semibold text-[#30261E] dark:text-[#F7F0E3] line-clamp-2 group-hover:text-[#8B6F52] dark:group-hover:text-[#D4A359] transition-colors">
            {document.filename}
          </h3>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-2 gap-2 text-xs text-[#5A4634] dark:text-[#DCC9AA] font-medium my-3">
          <span className="flex items-center gap-1.5 truncate">
            <Layers className="w-3.5 h-3.5 text-[#8B6F52] shrink-0" />
            {document.chunk_count} chunks
          </span>
          <span className="flex items-center gap-1.5 truncate">
            <HardDrive className="w-3.5 h-3.5 text-[#8B6F52] shrink-0" />
            {formatFileSize(document.file_size)}
          </span>
          <span className="flex items-center gap-1.5 col-span-2 truncate">
            <Calendar className="w-3.5 h-3.5 text-[#8B6F52] shrink-0" />
            {formatDate(document.created_at)}
          </span>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="pt-3 border-t border-[#D4C3A5]/50 dark:border-[#524436]/50 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/documents/${document.id}`);
            }}
            leftIcon={<Eye className="w-3.5 h-3.5 text-[#5A4634] dark:text-[#E8DCC8]" />}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#CDBB9D] dark:border-[#524436]"
            title="Open Document in Viewer"
          >
            Open
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleStartChatWithDoc();
            }}
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-[#8B6F52]" />}
            className="text-xs font-semibold px-2.5 py-1 text-[#5A4634] dark:text-[#E8DCC8] hover:bg-[#E1D2B8]/40 dark:hover:bg-[#3E3228] rounded-lg"
            title="Ask AI questions about this document"
          >
            Ask AI
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              documentService.downloadDocument(document.id, document.original_filename);
            }}
            title="Download original file"
            className="h-8 w-8 text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3] hover:bg-[#E1D2B8]/40 dark:hover:bg-[#3E3228]"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            isLoading={isDeleting}
            onClick={handleDelete}
            title="Delete Document"
            className="h-8 w-8 text-[#6B5C4D] dark:text-[#A89A89] hover:text-[#A65D50] dark:hover:text-[#A65D50] hover:bg-[#A65D50]/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
