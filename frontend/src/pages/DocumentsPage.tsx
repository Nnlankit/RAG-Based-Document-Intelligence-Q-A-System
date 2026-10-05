import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  Sparkles,
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentTable } from '../components/documents/DocumentTable';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useDebounce } from '../hooks/useDebounce';

export const DocumentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 200);

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.listDocuments(),
  });

  const documents = data?.documents || [];

  // Filter documents
  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      doc.original_filename.toLowerCase().includes(debouncedSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFormat === 'all') return true;
    const ext = doc.filename.split('.').pop()?.toLowerCase();
    return ext === selectedFormat;
  });

  const formatCounts = {
    all: documents.length,
    pdf: documents.filter((d) => d.filename.toLowerCase().endsWith('.pdf')).length,
    docx: documents.filter((d) => d.filename.toLowerCase().endsWith('.docx')).length,
    txt: documents.filter((d) => d.filename.toLowerCase().endsWith('.txt')).length,
    md: documents.filter((d) => d.filename.toLowerCase().endsWith('.md')).length,
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#30261E] dark:text-[#F7F0E3]">
            Document Repository
          </h1>
          <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5 font-medium">
            Manage your knowledge base, review indexed chunks, and inspect text extractions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setUploadModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="rounded-xl shadow-xs"
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search, Format Filters, View Toggle Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 bg-[#F7F0E3] dark:bg-[#342A22] rounded-2xl border border-[#D4C3A5] dark:border-[#524436] shadow-card">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5A4634] dark:text-[#DCC9AA] absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by filename or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#EEE3D0] dark:bg-[#2A221C] border border-[#CDBB9D] dark:border-[#524436] text-[#30261E] dark:text-[#F7F0E3] placeholder-[#6B5C4D]/80 dark:placeholder-[#B9A995]/80 focus:outline-none focus:ring-1 focus:ring-[#8B6F52]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(['all', 'pdf', 'docx', 'txt', 'md'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                selectedFormat === fmt
                  ? 'bg-[#CDB795] text-[#30261E] dark:bg-[#3E3228] dark:text-[#F7F0E3] font-semibold border border-[#B9A587] dark:border-[#5A4634]'
                  : 'text-[#5A4634] dark:text-[#DCC9AA] hover:bg-[#E9DDC8] dark:hover:bg-[#3E3228]'
              }`}
            >
              {fmt.toUpperCase()} ({formatCounts[fmt]})
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border-l border-[#D4C3A5]/60 dark:border-[#524436]/60 pl-3">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#CDB795] text-[#30261E] dark:bg-[#3E3228] dark:text-[#F7F0E3]'
                : 'text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3]'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-[#CDB795] text-[#30261E] dark:bg-[#3E3228] dark:text-[#F7F0E3]'
                : 'text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3]'
            }`}
            title="Table view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Grid or Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] space-y-3">
          <FileText className="w-10 h-10 text-[#8B6F52] mx-auto" />
          <h4 className="text-sm font-semibold text-[#30261E] dark:text-[#F7F0E3]">
            No matching documents found
          </h4>
          <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] max-w-sm mx-auto font-medium">
            {searchTerm
              ? `No documents match "${searchTerm}". Try a different keyword.`
              : 'Upload documents to build your vector knowledge base.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Upload Document
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <DocumentTable documents={filtered} />
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};
