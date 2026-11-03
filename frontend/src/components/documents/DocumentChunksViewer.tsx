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
    <div className="flex flex-col h-full bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] rounded-2xl overflow-hidden shadow-card">
      {/* Header & Filter */}
      <div className="p-4 border-b border-[#E8E1F2] dark:border-[#352B52] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5920B5]" />
            <h4 className="text-xs font-bold text-[#17152B] dark:text-white uppercase tracking-wider">
              Indexed Chunks ({chunks.length})
            </h4>
          </div>
          <span className="text-[11px] text-[#77738A] dark:text-[#A39EB8] font-mono font-medium">
            {filteredChunks.length} shown
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#77738A] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search within chunks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] text-[#17152B] dark:text-[#F5F3FF] placeholder-[#77738A]/70 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
          />
        </div>
      </div>

      {/* Chunk List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredChunks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#77738A] dark:text-[#A39EB8] font-medium">
            No chunks match your search query.
          </div>
        ) : (
          filteredChunks.map((chunk) => {
            const isHighlighted = highlightChunkId === chunk.id;
            return (
              <div
                key={chunk.id}
                onClick={() => onSelectChunk?.(chunk)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                  isHighlighted
                    ? 'border-[#5920B5] bg-[#F0EBFA] dark:bg-[#2A2047] ring-1 ring-[#5920B5]'
                    : 'border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] hover:border-[#8B5CF6]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0EBFA] text-[#5920B5] dark:bg-[#2A2047] dark:text-[#C4B5FD] border border-[#E8E1F2]">
                      Chunk #{chunk.chunk_index ?? 0}
                    </span>
                    {chunk.page_number && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        Page {chunk.page_number}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleCopy(chunk.id, chunk.content, e)}
                    className="p-1 rounded text-[#77738A] hover:text-[#5920B5] transition-colors"
                    title="Copy chunk text"
                  >
                    {copiedId === chunk.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="font-mono text-[11px] text-[#17152B] dark:text-[#E2DCF0] leading-relaxed line-clamp-4">
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
