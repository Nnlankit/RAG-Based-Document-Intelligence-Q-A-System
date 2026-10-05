import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Cpu,
  User,
  Copy,
  Check,
  Clock,
  Layers,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { SourceCard } from './SourceCard';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(true);

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end py-2">
        <div className="flex items-start gap-2.5 max-w-[80%]">
          <div className="bg-[#D8C6A7] text-[#30261E] dark:bg-[#3E3228] dark:text-[#F7F0E3] border border-[#CDBB9D] dark:border-[#5A4634] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-xs font-normal leading-relaxed">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#CDB795] text-[#5A4634] dark:bg-[#4A3B2F] dark:text-[#E8DCC8] flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 border border-[#B9A587] dark:border-[#5A4634]">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-3 group">
      {/* Bot Icon */}
      <div className="w-8 h-8 rounded-xl bg-[#5A4634] text-[#F7F0E3] flex items-center justify-center shadow-xs shrink-0 mt-1">
        <Cpu className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-3 bg-[#F7F0E3] dark:bg-[#2A221C] border border-[#D4C3A5] dark:border-[#4B3C2F] rounded-2xl p-4 shadow-card">
        {/* Header: Name, Copy button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3]">
              DocuMind AI
            </span>
            <span className="text-[10px] font-mono font-medium text-[#5A4634] dark:text-[#DCC9AA]">Llama 3.2</span>
          </div>

          <button
            onClick={handleCopyText}
            className="opacity-0 group-hover:opacity-100 p-1 text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3] rounded transition-opacity"
            title="Copy answer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#657A58]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Abstention Warning Banner */}
        {message.abstention && (
          <div className="p-3 rounded-xl bg-[#B38A4A]/10 border border-[#B38A4A]/30 flex items-start gap-2.5 text-[#8B6F52] dark:text-[#D4A359] text-xs">
            <AlertTriangle className="w-4 h-4 text-[#B38A4A] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Uncertain or Out-of-Domain Query</p>
              <p className="mt-0.5 text-[#5A4634] dark:text-[#D8C6A7]">
                The retrieved document chunks did not meet the confidence threshold. The model abstained or answered with explicit caveats to prevent hallucinations.
              </p>
            </div>
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-[#30261E] dark:text-[#F4EBDD] text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Telemetry Latency Chips */}
        {message.total_latency_ms !== undefined && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono font-medium text-[#5A4634] dark:text-[#DCC9AA] pt-1 border-t border-[#D4C3A5]/40 dark:border-[#4B3C2F]/40">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#8B6F52]" />
              Total: {(message.total_latency_ms / 1000).toFixed(2)}s
            </span>
            {message.retrieval_latency_ms !== undefined && (
              <span>• Retrieval: {message.retrieval_latency_ms.toFixed(0)}ms</span>
            )}
            {message.generation_latency_ms !== undefined && (
              <span>• Gen: {(message.generation_latency_ms / 1000).toFixed(2)}s</span>
            )}
          </div>
        )}

        {/* Grounded Source Attributions */}
        {message.sources && message.sources.length > 0 && (
          <div className="pt-2 border-t border-[#D4C3A5]/40 dark:border-[#4B3C2F]/40">
            <div
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#5A4634] dark:text-[#DCC9AA] cursor-pointer select-none mb-2"
            >
              <Layers className="w-3.5 h-3.5 text-[#8B6F52]" />
              <span>Grounded Sources ({message.sources.length})</span>
              {sourcesOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#5A4634] dark:text-[#DCC9AA]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#5A4634] dark:text-[#DCC9AA]" />
              )}
            </div>

            {sourcesOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.sources.map((source, idx) => (
                  <SourceCard key={`${source.chunk_id}-${idx}`} source={source} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
