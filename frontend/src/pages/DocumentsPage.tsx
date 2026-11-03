import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  Sparkles,
  Layers,
  HardDrive,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentTable } from '../components/documents/DocumentTable';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useDebounce } from '../hooks/useDebounce';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [selectedFormat, setSelectedFormat] = useState<string>(() => {
    const type = searchParams.get('type')?.toLowerCase();
    return ['pdf', 'docx', 'txt', 'md'].includes(type || '') ? type! : 'all';
  });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Sync state if URL query param changes
  useEffect(() => {
    const type = searchParams.get('type')?.toLowerCase();
    if (type && ['pdf', 'docx', 'txt', 'md'].includes(type)) {
      setSelectedFormat(type);
    }
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const debouncedSearch = useDebounce(searchTerm, 200);

  const handleFormatChange = (fmt: string) => {
    setSelectedFormat(fmt);
    const newParams = new URLSearchParams(searchParams);
    if (fmt === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', fmt);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedFormat('all');
    setSearchParams({}, { replace: true });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.listDocuments(),
  });

  const documents = data?.documents || [];

  // Filter documents
  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      doc.original_filename?.toLowerCase().includes(debouncedSearch.toLowerCase());

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

  const totalChunks = documents.reduce((sum, d) => sum + (d.chunk_count || 0), 0);
  const totalBytes = documents.reduce((sum, d) => sum + (d.file_size || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#17152B] dark:text-white">
            Document Repository
          </h1>
          <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-1 font-medium">
            Manage your knowledge base, review indexed chunks, and inspect text extractions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setUploadModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-purple hover:shadow-purple-lg"
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Summary Chips (Clickable Filters & Deep Links) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => handleFormatChange('all')}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#8B5CF6] hover:shadow-card transition-all group"
          title="Show all documents"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#A78BFA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#77738A] uppercase font-bold tracking-wider">Total Documents</p>
              <p className="text-base font-extrabold text-[#17152B] dark:text-white">{documents.length}</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/knowledge-base')}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#8B5CF6] hover:shadow-card transition-all group"
          title="Open Vector Knowledge Base"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] text-[#8B5CF6] dark:text-[#A78BFA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#77738A] uppercase font-bold tracking-wider">Indexed Chunks</p>
              <p className="text-base font-extrabold text-[#17152B] dark:text-white">{totalChunks}</p>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#77738A] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div
          onClick={() => navigate('/knowledge-base')}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#8B5CF6] hover:shadow-card transition-all group"
          title="View Vector Storage Metrics"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#A78BFA] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#77738A] uppercase font-bold tracking-wider">Storage Volume</p>
              <p className="text-base font-extrabold text-[#17152B] dark:text-white">{totalMB} MB</p>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#77738A] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div
          onClick={() => navigate('/settings')}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#8B5CF6] hover:shadow-card transition-all group"
          title="Open Settings & Diagnostics"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#77738A] uppercase font-bold tracking-wider">Vector Store</p>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">pgvector Active</p>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#77738A] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Search, Format Filters, View Toggle Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-[#1E1733] rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] shadow-card">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#77738A] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by filename or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs rounded-xl bg-[#FAF8FD] dark:bg-[#150F24] border border-[#E8E1F2] dark:border-[#352B52] text-[#17152B] dark:text-[#F5F3FF] placeholder-[#77738A]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-[#77738A] hover:text-[#17152B] p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(['all', 'pdf', 'docx', 'txt', 'md'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleFormatChange(fmt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shrink-0 ${
                selectedFormat === fmt
                  ? 'bg-[#5920B5] text-white shadow-purple'
                  : 'bg-[#FAF8FD] dark:bg-[#150F24] text-[#77738A] dark:text-[#A39EB8] hover:text-[#17152B] hover:bg-[#F0EBFA]'
              }`}
            >
              {fmt} ({formatCounts[fmt]})
            </button>
          ))}

          {(selectedFormat !== 'all' || searchTerm) && (
            <button
              onClick={handleClearFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1 shrink-0 transition-colors"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#FAF8FD] dark:bg-[#150F24] p-1 rounded-xl border border-[#E8E1F2] dark:border-[#352B52] self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-[#1E1733] text-[#5920B5] dark:text-white shadow-xs'
                : 'text-[#77738A] hover:text-[#17152B]'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-[#1E1733] text-[#5920B5] dark:text-white shadow-xs'
                : 'text-[#77738A] hover:text-[#17152B]'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Display: Grid vs Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border-2 border-dashed border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card space-y-3">
          <FileText className="w-12 h-12 text-[#5920B5] mx-auto opacity-60" />
          <h3 className="text-base font-bold text-[#17152B] dark:text-white">
            No matching documents found
          </h3>
          <p className="text-xs text-[#77738A] dark:text-[#A39EB8] max-w-sm mx-auto">
            {searchTerm || selectedFormat !== 'all'
              ? 'Try modifying your search query or format filter.'
              : 'Upload your first document to get started.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            {(searchTerm || selectedFormat !== 'all') && (
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
            <Button variant="primary" onClick={() => setUploadModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Upload Document
            </Button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <DocumentTable
          documents={filtered}
          enableSearch={false}
          enablePagination={true}
          pageSize={10}
        />
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};
