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
    staleTime: Infinity,
  });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => prev + 1);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    documentService.downloadDocument(document.id, document.original_filename);
  };

  // URL for iframe inline preview (includes #page and #zoom parameters)
  const pdfSource = `${fileUrl}#page=${currentPage}&zoom=${zoom}`;

  // Filter chunks if search term provided
  const chunks = chunksData?.chunks || [];
  const filteredChunks = searchTerm.trim()
    ? chunks.filter((c) =>
        c.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chunks;

  return (
    <div className="flex flex-col h-full bg-[#EEE3D0]/50 dark:bg-[#2A221C]/50 border border-[#D4C3A5] dark:border-[#524436] rounded-2xl overflow-hidden shadow-card">
      {/* Top Professional Toolbar */}
      <div className="min-h-12 px-4 py-2 bg-[#F7F0E3] dark:bg-[#342A22] border-b border-[#D4C3A5] dark:border-[#524436] flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Left: Document Identity */}
        <div className="flex items-center gap-2 min-w-0 max-w-xs sm:max-w-sm truncate">
          <FileText className="w-4 h-4 text-[#8B6F52] shrink-0" />
          <span
            className="text-xs font-bold text-[#30261E] dark:text-[#F7F0E3] truncate"
            title={document.filename}
          >
            {document.filename}
          </span>
          {isPdf && currentPage > 1 && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#E1D2B8] text-[#5A4634] dark:bg-[#3E3228] dark:text-[#E8DCC8] rounded-md font-semibold border border-[#CDBB9D] dark:border-[#5A4634] shrink-0">
              p. {currentPage}
            </span>
          )}
        </div>

        {/* Center: Viewer Navigation & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isPdf ? (
            <>
              {/* Page Navigator */}
              <div className="flex items-center bg-[#EEE3D0] dark:bg-[#2B231D] rounded-lg border border-[#D4C3A5] dark:border-[#524436] p-0.5 text-xs font-medium text-[#5A4634] dark:text-[#DCC9AA]">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="p-1 rounded hover:bg-[#E1D2B8] dark:hover:bg-[#3E3228] disabled:opacity-40 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] font-semibold select-none">
                  Page {currentPage}
                </span>
                <button
                  onClick={handleNextPage}
                  className="p-1 rounded hover:bg-[#E1D2B8] dark:hover:bg-[#3E3228] transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center bg-[#EEE3D0] dark:bg-[#2B231D] rounded-lg border border-[#D4C3A5] dark:border-[#524436] p-0.5 text-xs font-medium text-[#5A4634] dark:text-[#DCC9AA]">
                <button
                  onClick={handleZoomOut}
                  className="p-1 rounded hover:bg-[#E1D2B8] dark:hover:bg-[#3E3228] transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-2 font-mono text-[11px] font-semibold hover:underline"
                  title="Reset to 100%"
                >
                  {zoom}%
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-1 rounded hover:bg-[#E1D2B8] dark:hover:bg-[#3E3228] transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : isMarkdown ? (
            /* Markdown Mode Switcher */
            <div className="flex items-center bg-[#EEE3D0] dark:bg-[#2B231D] rounded-lg border border-[#D4C3A5] dark:border-[#524436] p-0.5 text-xs font-medium">
              <button
                onClick={() => setMarkdownMode('rendered')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                  markdownMode === 'rendered'
                    ? 'bg-[#5A4634] text-[#F7F0E3] dark:bg-[#E5D5BA] dark:text-[#211B16] shadow-xs'
                    : 'text-[#5A4634] dark:text-[#DCC9AA] hover:bg-[#E1D2B8]/60'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                Rendered
              </button>
              <button
                onClick={() => setMarkdownMode('raw')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                  markdownMode === 'raw'
                    ? 'bg-[#5A4634] text-[#F7F0E3] dark:bg-[#E5D5BA] dark:text-[#211B16] shadow-xs'
                    : 'text-[#5A4634] dark:text-[#DCC9AA] hover:bg-[#E1D2B8]/60'
                }`}
              >
                <Code className="w-3 h-3" />
                Raw Source
              </button>
            </div>
          ) : (
            /* Search filter for TXT or DOCX */
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B6F52]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search document text..."
                className="pl-8 pr-3 py-1 text-xs rounded-lg border border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/60 dark:bg-[#2B231D] text-[#30261E] dark:text-[#F7F0E3] placeholder-[#6B5C4D]/80 dark:placeholder-[#B9A995]/80 focus:outline-none focus:ring-1 focus:ring-[#8B6F52] w-40 sm:w-52"
              />
            </div>
          )}
        </div>

        {/* Right: Popout & Explicit Download Action */}
        <div className="flex items-center gap-2">
          {/* External window (opens inline preview in full tab) */}
          <button
            onClick={() => window.open(fileUrl, '_blank')}
            className="p-1.5 rounded-lg text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3] hover:bg-[#E1D2B8]/50 dark:hover:bg-[#3E3228] transition-colors"
            title="Open preview in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Explicit Download Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs font-semibold rounded-lg border border-[#CDBB9D] dark:border-[#554638] shadow-xs"
            title="Download original file to your device"
          >
            Download
          </Button>
        </div>
      </div>

      {/* Main Viewer Body */}
      <div className="flex-1 w-full h-full relative overflow-auto p-2 sm:p-3">
        {/* CASE 1: PDF Viewer */}
        {isPdf ? (
          <div className="w-full h-full flex flex-col rounded-xl overflow-hidden border border-[#D4C3A5] dark:border-[#524436] shadow-xs bg-white">
            <iframe
              key={pdfSource}
              src={pdfSource}
              title={document.filename}
              className="w-full h-full flex-1 border-0"
            />
          </div>
        ) : isMarkdown ? (
          /* CASE 2: Markdown Viewer */
          <div className="w-full h-full bg-[#F7F0E3] dark:bg-[#342A22] rounded-xl border border-[#D4C3A5] dark:border-[#524436] shadow-xs p-6 overflow-auto">
            {textLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-2 text-[#5A4634] dark:text-[#DCC9AA]">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Loading markdown document...</span>
              </div>
            ) : textContent ? (
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D4C3A5]/50 dark:border-[#524436]/50">
                  <span className="text-xs font-semibold text-[#5A4634] dark:text-[#DCC9AA] flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-[#8B6F52]" />
                    {textContent.length.toLocaleString()} characters •{' '}
                    {textContent.split(/\s+/).length.toLocaleString()} words
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyText(textContent)}
                    leftIcon={
                      copied ? (
                        <Check className="w-3.5 h-3.5 text-[#657A58]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                    className="text-xs"
                  >
                    {copied ? 'Copied!' : 'Copy Markdown'}
                  </Button>
                </div>

                {markdownMode === 'rendered' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {textContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <pre className="font-mono text-xs text-[#30261E] dark:text-[#F4EBDD] bg-[#EEE3D0]/60 dark:bg-[#2A221C] p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[#D4C3A5] dark:border-[#524436]">
                    {textContent}
                  </pre>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[#5A4634] dark:text-[#DCC9AA]">
                Unable to load markdown content.
              </div>
            )}
          </div>
        ) : isTxt ? (
          /* CASE 3: Plaintext Viewer */
          <div className="w-full h-full bg-[#F7F0E3] dark:bg-[#342A22] rounded-xl border border-[#D4C3A5] dark:border-[#524436] shadow-xs p-6 overflow-auto">
            {textLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-2 text-[#5A4634] dark:text-[#DCC9AA]">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Loading text document...</span>
              </div>
            ) : textContent ? (
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D4C3A5]/50 dark:border-[#524436]/50">
                  <span className="text-xs font-semibold text-[#5A4634] dark:text-[#DCC9AA]">
                    {textContent.split('\n').length} lines •{' '}
                    {textContent.length.toLocaleString()} characters
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyText(textContent)}
                    leftIcon={
                      copied ? (
                        <Check className="w-3.5 h-3.5 text-[#657A58]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                    className="text-xs"
                  >
                    {copied ? 'Copied!' : 'Copy Text'}
                  </Button>
                </div>
                <pre className="font-mono text-xs text-[#30261E] dark:text-[#F4EBDD] bg-[#EEE3D0]/50 dark:bg-[#2A221C] p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[#D4C3A5] dark:border-[#524436]">
                  {textContent}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[#5A4634] dark:text-[#DCC9AA]">
                Unable to load text content.
              </div>
            )}
          </div>
        ) : (
          /* CASE 4: DOCX / Formatted Document Reader (from extracted chunks) */
          <div className="w-full h-full bg-[#F7F0E3] dark:bg-[#342A22] rounded-xl border border-[#D4C3A5] dark:border-[#524436] shadow-xs p-6 overflow-auto space-y-4">
            {/* Document Header Banner */}
            <div className="p-4 rounded-xl bg-[#EEE3D0] dark:bg-[#2B231D] border border-[#D4C3A5] dark:border-[#524436] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E1D2B8] dark:bg-[#3E3228] text-[#8B6F52] dark:text-[#E8DCC8]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#30261E] dark:text-[#F7F0E3] uppercase tracking-wider">
                    {isDocx ? 'Word Document (DOCX) Preview' : 'Document In-App Reader'}
                  </h4>
                  <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5">
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
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-[#5A4634] dark:text-[#DCC9AA]">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Loading extracted document sections...</span>
              </div>
            ) : filteredChunks.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5A4634] dark:text-[#DCC9AA]">
                {searchTerm
                  ? 'No matching text found in document chunks.'
                  : 'No text chunks available for preview.'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChunks.map((chunk, idx) => (
                  <div
                    key={chunk.id || idx}
                    className="p-4 rounded-xl border border-[#D4C3A5]/70 dark:border-[#524436] bg-[#FAF5EE] dark:bg-[#2E241D] space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#5A4634] dark:text-[#DCC9AA]">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Layers className="w-3.5 h-3.5 text-[#8B6F52]" />
                        Section {chunk.chunk_index + 1} of {chunks.length}
                      </span>
                      {chunk.page_number && (
                        <span className="px-2 py-0.5 rounded bg-[#E1D2B8] dark:bg-[#3E3228] text-[#5A4634] dark:text-[#E8DCC8] border border-[#CDBB9D] dark:border-[#524436]">
                          Page {chunk.page_number}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-sans text-[#30261E] dark:text-[#F4EBDD] whitespace-pre-wrap leading-relaxed">
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
