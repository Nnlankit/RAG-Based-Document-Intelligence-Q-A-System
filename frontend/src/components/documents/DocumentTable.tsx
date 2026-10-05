import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Trash2,
  Star,
  ExternalLink,
  Eye,
  Download,
} from 'lucide-react';
import { DocumentItem } from '../../types/document';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useChatSettings } from '../../context/ChatSettingsContext';
import { useToast } from '../common/Toast';
import { documentService } from '../../services/documentService';
import { useQueryClient } from '@tanstack/react-query';

interface DocumentTableProps {
  documents: DocumentItem[];
}

export const DocumentTable: React.FC<DocumentTableProps> = ({ documents }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isFavorite, toggleFavorite, setScopeDocumentIds } = useChatSettings();
  const { success, error } = useToast();

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

  const handleDelete = async (e: React.MouseEvent, doc: DocumentItem) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${doc.filename}"?`)) return;

    try {
      await documentService.deleteDocument(doc.id);
      success('Document Deleted', `"${doc.filename}" was successfully removed.`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-stats'] });
    } catch (err: any) {
      error('Delete Failed', err.message || 'Could not delete document');
    }
  };

  return (
    <div className="w-full overflow-x-auto border border-[#D4C3A5] dark:border-[#524436] rounded-xl bg-[#F7F0E3] dark:bg-[#342A22] shadow-card">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#EEE3D0] dark:bg-[#2A221C] text-[#5A4634] dark:text-[#DCC9AA] font-semibold border-b border-[#D4C3A5] dark:border-[#524436] uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4 w-10 text-center">Fav</th>
            <th className="py-3 px-4">Document</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Chunks</th>
            <th className="py-3 px-4">Size</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D4C3A5]/40 dark:divide-[#524436]/40">
          {documents.map((doc) => {
            const starred = isFavorite(doc.id);
            return (
              <tr
                key={doc.id}
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="hover:bg-[#EDE1CD]/70 dark:hover:bg-[#3D3128]/70 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleFavorite(doc.id)}
                    className={`p-1 rounded ${
                      starred ? 'text-[#B38A4A]' : 'text-[#6B5C4D] hover:text-[#5A4634]'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${starred ? 'fill-current' : ''}`} />
                  </button>
                </td>
                <td className="py-3 px-4 font-semibold text-[#30261E] dark:text-[#F7F0E3] max-w-xs truncate">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#8B6F52] shrink-0" />
                    <span className="truncate group-hover:text-[#8B6F52] transition-colors" title={doc.filename}>
                      {doc.filename}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">{getFormatBadge(doc.filename)}</td>
                <td className="py-3 px-4 text-[#5A4634] dark:text-[#D8C6A7] font-mono">
                  {doc.chunk_count}
                </td>
                <td className="py-3 px-4 text-[#5A4634] dark:text-[#DCC9AA]">
                  {formatFileSize(doc.file_size)}
                </td>
                <td className="py-3 px-4 text-[#5A4634] dark:text-[#DCC9AA]">
                  {formatDate(doc.created_at)}
                </td>
                <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
                <td className="py-3 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    title="Open Document in Viewer"
                    className="h-7 w-7 text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] hover:bg-[#E1D2B8]/40 dark:hover:bg-[#3E3228]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setScopeDocumentIds([doc.id]);
                      navigate('/chat');
                    }}
                    title="Ask AI about this document"
                    className="h-7 w-7 text-[#8B6F52] hover:text-[#5A4634] hover:bg-[#E1D2B8]/40 dark:hover:bg-[#3E3228]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => documentService.downloadDocument(doc.id, doc.filename)}
                    title="Download original document"
                    className="h-7 w-7 text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] hover:bg-[#E1D2B8]/40 dark:hover:bg-[#3E3228]"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(e, doc)}
                    title="Delete Document"
                    className="h-7 w-7 text-[#6B5C4D] dark:text-[#A89A89] hover:text-[#A65D50] hover:bg-[#A65D50]/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
