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
    <div className="flex flex-col h-full bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] rounded-2xl overflow-hidden shadow-card">
      {/* Header & Filter */}
      <div className="p-4 border-b border-[#E9E1CC] dark:border-[#303238] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#202124] dark:text-[#FFE89A]" />
            <h4 className="text-xs font-bold text-[#202124] dark:text-white uppercase tracking-wider">
              Indexed Chunks ({chunks.length})
            </h4>
          </div>
          <span className="text-[11px] text-[#77746B] dark:text-[#A8A499] font-mono font-medium">
            {filteredChunks.length} shown
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#77746B] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search within chunks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFF9E8] dark:bg-[#1A1A1C] text-[#202124] dark:text-[#FFFDF5] placeholder-[#77746B]/70 focus:outline-none focus:ring-1 focus:ring-[#FFE89A]"
          />
        </div>
      </div>

      {/* Chunk List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredChunks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#77746B] dark:text-[#A8A499] font-medium">
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
                    ? 'border-[#4D9B45] bg-[#E5F4DC] ring-1 ring-[#4D9B45]'
                    : 'border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#1A1A1C] hover:border-[#E8BD42]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF9E8] text-[#202124] border border-[#E9E1CC]">
                      Chunk #{chunk.chunk_index ?? 0}
                    </span>
                    {chunk.page_number && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E5F4DC] text-[#245B32]">
                        Page {chunk.page_number}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleCopy(chunk.id, chunk.content, e)}
                    className="p-1 rounded text-[#77746B] hover:text-[#202124] transition-colors"
                    title="Copy chunk text"
                  >
                    {copiedId === chunk.id ? (
                      <Check className="w-3.5 h-3.5 text-[#4D9B45]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="font-mono text-[11px] text-[#202124] dark:text-[#E9E1CC] leading-relaxed line-clamp-4">
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
