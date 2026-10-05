import React, { useState } from 'react';
import { Search, Copy, Check, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { DocumentChunkItem } from '../../types/document';
import { Badge } from '../common/Badge';

interface DocumentChunksViewerProps {
  chunks: DocumentChunkItem[];
  highlightChunkId?: string | null;
  onSelectChunk?: (chunk: DocumentChunkItem) => void;
}

export const DocumentChunksViewer: React.FC<DocumentChunksViewerProps> = ({
  chunks,
  highlightChunkId,
  onSelectChunk,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredChunks = chunks.filter(
    (c) =>
      c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F0E3] dark:bg-[#342A22] border border-[#D4C3A5] dark:border-[#524436] rounded-2xl overflow-hidden shadow-card">
      {/* Header & Filter */}
      <div className="p-4 border-b border-[#D4C3A5]/60 dark:border-[#524436]/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8B6F52]" />
            <h4 className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3] uppercase tracking-wider">
              Indexed Chunks ({chunks.length})
            </h4>
          </div>
          <span className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA] font-mono font-medium">
            {filteredChunks.length} shown
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5A4634] dark:text-[#DCC9AA] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search within chunks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#CDBB9D] dark:border-[#524436] bg-[#EEE3D0] dark:bg-[#2A221C] text-[#30261E] dark:text-[#F7F0E3] placeholder-[#6B5C4D]/80 dark:placeholder-[#B9A995]/80 focus:outline-none focus:ring-1 focus:ring-[#8B6F52]"
          />
        </div>
      </div>

      {/* Chunk List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredChunks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#5A4634] dark:text-[#DCC9AA] font-medium">
            No chunks match your search query.
          </div>
        ) : (
          filteredChunks.map((chunk) => {
            const isHighlighted = highlightChunkId === chunk.id;
            return (
              <div
                key={chunk.id}
                onClick={() => onSelectChunk?.(chunk)}
                className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 cursor-pointer ${
                  isHighlighted
                    ? 'border-[#8B6F52] bg-[#E1D2B8] dark:bg-[#4A3B2F] ring-1 ring-[#8B6F52]'
                    : 'border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/60 dark:bg-[#2A221C]/60 hover:bg-[#E5D6BD] dark:hover:bg-[#3D3128] hover:border-[#CDBB9D]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#5A4634] dark:text-[#E8DCC8]">
                      Chunk #{chunk.chunk_index + 1}
                    </span>
                    {chunk.page_number && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#B87952] bg-[#F7F0E3] dark:bg-[#342A22] border border-[#D4C3A5]/60 dark:border-[#524436]">
                        Page {chunk.page_number}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#5A4634] dark:text-[#DCC9AA] font-medium">
                      {chunk.content.length} chars
                    </span>
                    <button
                      onClick={(e) => handleCopy(chunk.id, chunk.content, e)}
                      className="p-1 text-[#5A4634] hover:text-[#211B16] dark:hover:text-[#F7F0E3] rounded"
                      title="Copy chunk text"
                    >
                      {copiedId === chunk.id ? (
                        <Check className="w-3.5 h-3.5 text-[#657A58]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[#5A4634] dark:text-[#D8C6A7] font-sans leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {chunk.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
