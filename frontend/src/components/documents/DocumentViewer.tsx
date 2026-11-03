import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  Search,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Code,
  Layers,
  FileCode,
  Loader2,
} from 'lucide-react';
import { documentService } from '../../services/documentService';
import { DocumentItem } from '../../types/document';
import { Button } from '../common/Button';

interface DocumentViewerProps {
  document: DocumentItem;
  targetPage?: number | null;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  targetPage,
}) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState<number>(targetPage || 1);
  const [markdownMode, setMarkdownMode] = useState<'rendered' | 'raw'>('rendered');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const fileUrl = documentService.getDocumentFileUrl(document.id);
  const downloadUrl = documentService.getDocumentDownloadUrl(document.id);

  const filenameLower = (document.filename || '').toLowerCase();
  const isPdf =
    document.mime_type === 'application/pdf' || filenameLower.endsWith('.pdf');
  const isMarkdown =
    filenameLower.endsWith('.md') ||
    filenameLower.endsWith('.markdown') ||
    document.mime_type === 'text/markdown';
  const isTxt =
    filenameLower.endsWith('.txt') ||
    filenameLower.endsWith('.log') ||
    document.mime_type === 'text/plain';
  const isDocx =
    filenameLower.endsWith('.docx') ||
    filenameLower.endsWith('.doc') ||
    (document.mime_type && document.mime_type.includes('wordprocessingml'));

  // Update current page when targetPage changes (e.g. from citation click)
  useEffect(() => {
    if (targetPage) {
      setCurrentPage(targetPage);
    }
  }, [targetPage]);

  // Query raw text for text/markdown preview
  const { data: textContent, isLoading: textLoading } = useQuery({
    queryKey: ['document-text', document.id],
    queryFn: () => documentService.getDocumentText(document.id),
    enabled: isMarkdown || isTxt,
    staleTime: Infinity,
  });

  // Query extracted chunks for DOCX or other non-PDF documents
  const { data: chunksData, isLoading: chunksLoading } = useQuery({
    queryKey: ['document-chunks', document.id],
    queryFn: () => documentService.getDocumentChunks(document.id),
    enabled: isDocx || (!isPdf && !isMarkdown && !isTxt),
  });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoom(100);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => prev + 1);

  const handleDownload = () => {
    documentService.downloadDocument(document.id, document.filename);
  };

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chunks = chunksData?.chunks || [];
  const filteredChunks = searchTerm.trim()
    ? chunks.filter((c: any) =>
        c.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chunks;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] rounded-2xl overflow-hidden shadow-card">
      {/* Top Controls Toolbar */}
      <div className="h-12 px-4 border-b border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] flex items-center justify-between gap-3 shrink-0">
        {/* Left: Document details chip */}
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-[#5920B5] shrink-0" />
          <span
            className="text-xs font-bold text-[#17152B] dark:text-white truncate"
            title={document.filename}
          >
            {document.filename}
          </span>
          {isPdf && currentPage > 1 && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#F0EBFA] text-[#5920B5] rounded-md font-bold border border-[#E8E1F2] shrink-0">
              p. {currentPage}
            </span>
          )}
        </div>

        {/* Center: Viewer Navigation & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isPdf ? (
            <>
              {/* Page Navigator */}
              <div className="flex items-center bg-white dark:bg-[#1E1733] rounded-xl border border-[#E8E1F2] dark:border-[#352B52] p-0.5 text-xs font-semibold text-[#17152B] dark:text-white">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="p-1 rounded-lg hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] disabled:opacity-40 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] font-bold select-none">
                  Page {currentPage}
                </span>
                <button
                  onClick={handleNextPage}
                  className="p-1 rounded-lg hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center bg-white dark:bg-[#1E1733] rounded-xl border border-[#E8E1F2] dark:border-[#352B52] p-0.5 text-xs font-semibold text-[#17152B] dark:text-white">
                <button
                  onClick={handleZoomOut}
                  className="p-1 rounded-lg hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-2 font-mono text-[11px] font-bold hover:underline"
                  title="Reset to 100%"
                >
                  {zoom}%
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-1 rounded-lg hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : isMarkdown ? (
            /* Markdown Mode Switcher */
            <div className="flex items-center bg-white dark:bg-[#1E1733] rounded-xl border border-[#E8E1F2] dark:border-[#352B52] p-0.5 text-xs font-semibold">
              <button
                onClick={() => setMarkdownMode('rendered')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  markdownMode === 'rendered'
                    ? 'bg-[#5920B5] text-white shadow-purple'
                    : 'text-[#77738A] hover:bg-[#F0EBFA]'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                Rendered
              </button>
              <button
                onClick={() => setMarkdownMode('raw')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  markdownMode === 'raw'
                    ? 'bg-[#5920B5] text-white shadow-purple'
                    : 'text-[#77738A] hover:bg-[#F0EBFA]'
                }`}
              >
                <Code className="w-3 h-3" />
                Raw Source
              </button>
            </div>
          ) : (
            /* Search filter for TXT or DOCX */
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#77738A]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search document text..."
                className="pl-8 pr-3 py-1 text-xs rounded-xl border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] text-[#17152B] dark:text-[#F5F3FF] placeholder-[#77738A]/70 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] w-40 sm:w-52"
              />
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => window.open(fileUrl, '_blank')}
            className="p-1.5 rounded-lg text-[#77738A] hover:text-[#5920B5] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-[#77738A] hover:text-[#5920B5] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
            title="Download document"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[#F8F6FC] dark:bg-[#120D20] p-4 flex items-center justify-center">
        {isPdf ? (
          /* CASE 1: Native PDF Preview (iframe with #page=X) */
          <div
            className="w-full h-full bg-white rounded-xl shadow-card overflow-hidden transition-transform duration-150 origin-top"
            style={{ transform: `scale(${zoom / 100})`, height: `${100 * (100 / zoom)}%` }}
          >
            <iframe
              src={`${fileUrl}#page=${currentPage}&zoom=${zoom}`}
              title={document.filename}
              className="w-full h-full border-none"
            />
          </div>
        ) : isMarkdown ? (
          /* CASE 2: Markdown File Viewer (Rendered / Raw) */
          <div className="w-full h-full bg-white dark:bg-[#1E1733] rounded-xl border border-[#E8E1F2] dark:border-[#352B52] shadow-card p-6 overflow-auto">
            {textLoading ? (
              <div className="flex items-center justify-center h-full text-xs text-[#77738A]">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading markdown content...
              </div>
            ) : markdownMode === 'rendered' ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {textContent || 'No content found in markdown file.'}
                </ReactMarkdown>
              </div>
            ) : (
              <pre className="text-xs font-mono bg-[#211A35] text-white p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
                {textContent}
              </pre>
            )}
          </div>
        ) : isTxt ? (
          /* CASE 3: Plain Text Viewer */
          <div className="w-full h-full bg-white dark:bg-[#1E1733] rounded-xl border border-[#E8E1F2] dark:border-[#352B52] shadow-card p-6 overflow-auto">
            {textLoading ? (
              <div className="flex items-center justify-center h-full text-xs text-[#77738A]">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading text file...
              </div>
            ) : (
              <pre className="text-xs font-mono text-[#17152B] dark:text-[#E2DCF0] whitespace-pre-wrap leading-relaxed">
                {textContent}
              </pre>
            )}
          </div>
        ) : (
          /* CASE 4: DOCX / Formatted Document Reader (from extracted chunks) */
          <div className="w-full h-full bg-white dark:bg-[#1E1733] rounded-xl border border-[#E8E1F2] dark:border-[#352B52] shadow-card p-6 overflow-auto space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF8FD] dark:bg-[#150F24] border border-[#E8E1F2] dark:border-[#352B52] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#A78BFA]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#17152B] dark:text-white uppercase tracking-wider">
                    {isDocx ? 'Word Document (DOCX) Preview' : 'Document In-App Reader'}
                  </h4>
                  <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-0.5">
                    Rendered directly inside the application from extracted text chunks.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleDownload}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="shrink-0"
              >
                Download Original File
              </Button>
            </div>

            {/* Extracted Chunks Content Stream */}
            {chunksLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-[#77738A]">
                <Loader2 className="w-6 h-6 animate-spin text-[#5920B5]" />
                <span className="text-xs">Loading extracted document sections...</span>
              </div>
            ) : filteredChunks.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#77738A]">
                {searchTerm
                  ? 'No matching text found in document chunks.'
                  : 'No text chunks available for preview.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredChunks.map((chunk: any, idx: number) => (
                  <div
                    key={chunk.id || idx}
                    className="p-4 rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#77738A]">
                      <span className="flex items-center gap-1.5 font-mono text-[#5920B5] dark:text-[#A78BFA]">
                        <Layers className="w-3.5 h-3.5" />
                        Section {chunk.chunk_index + 1} of {chunks.length}
                      </span>
                      {chunk.page_number && (
                        <span className="px-2 py-0.5 rounded bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#C4B5FD] border border-[#E8E1F2]">
                          Page {chunk.page_number}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-sans text-[#17152B] dark:text-[#F5F3FF] whitespace-pre-wrap leading-relaxed">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
