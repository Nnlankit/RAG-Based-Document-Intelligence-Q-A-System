import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { SourceAttribution } from '../../types/chat';
import { Badge } from '../common/Badge';

interface SourceCardProps {
  source: SourceAttribution;
  index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const scorePercent = Math.round(source.score * 100);

  const handleOpenDoc = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/documents/${source.document_id}${source.page_number ? `?page=${source.page_number}` : ''}`);
  };

  return (
    <div className="border border-[#D4C3A5] dark:border-[#524436] rounded-xl bg-[#EEE3D0] dark:bg-[#342A22] text-xs overflow-hidden transition-all hover:bg-[#E5D6BD] dark:hover:bg-[#3D3128] hover:border-[#CDBB9D] dark:hover:border-[#6B5A49] shadow-xs">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-3.5 py-2 flex items-center justify-between cursor-pointer select-none gap-2"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="w-5 h-5 rounded-md bg-[#D8C6A7] dark:bg-[#4A3B2F] text-[#5A4634] dark:text-[#E8DCC8] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border border-[#CDBB9D] dark:border-[#5A4634]">
            {index + 1}
          </span>
          <FileText className="w-3.5 h-3.5 text-[#8B6F52] shrink-0" />
          <span className="font-semibold text-[#30261E] dark:text-[#F7F0E3] truncate" title={source.filename}>
            {source.filename}
          </span>
          {source.page_number && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#B87952] bg-[#F7F0E3] dark:bg-[#2A221C] border border-[#D4C3A5]/60 dark:border-[#524436]">
              p. {source.page_number}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#657A58]/15 text-[#657A58] dark:text-[#88A676] border border-[#657A58]/30 font-semibold"
            title="Vector similarity / fused RRF score"
          >
            {scorePercent}%
          </span>
          <button
            onClick={handleOpenDoc}
            className="p-1 text-[#5A4634] hover:text-[#30261E] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3] rounded transition-colors"
            title="Inspect document source"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <span className="text-[#5A4634] dark:text-[#DCC9AA]">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {/* Snippet body */}
      {expanded && (
        <div className="px-3.5 pb-3 pt-2 border-t border-[#D4C3A5]/60 dark:border-[#524436]/60 bg-[#F7F0E3]/70 dark:bg-[#2E241D]/70">
          <p className="text-[#5A4634] dark:text-[#D8C6A7] font-sans leading-relaxed whitespace-pre-wrap italic">
            "{source.snippet}"
          </p>
        </div>
      )}
    </div>
  );
};
