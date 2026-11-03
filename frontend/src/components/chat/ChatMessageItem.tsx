import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage, SourceAttribution } from '../../types/chat';
import { useToast } from '../common/Toast';

interface ChatMessageItemProps {
  message: ChatMessage;
  isLatestAssistant?: boolean;
  onRegenerate?: () => void;
  onSelectPrompt?: (prompt: string) => void;
  isStreaming?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isLatestAssistant = false,
  onRegenerate,
  onSelectPrompt,
  isStreaming = false,
}) => {
  const navigate = useNavigate();
  const { success, info } = useToast();
  const isUser = message.role === 'user';

  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const [showPerf, setShowPerf] = useState(false);
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    success('Copied to Clipboard', 'Answer copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'liked' | 'disliked') => {
    if (feedback === type) {
      setFeedback(null);
    } else {
      setFeedback(type);
      info(
        type === 'liked' ? 'Feedback Submitted' : 'Feedback Recorded',
        type === 'liked'
          ? 'Thanks! We will use this to keep improving RAG accuracy.'
          : 'Thank you for flagging. We will review grounded chunks.'
      );
    }
  };

  // Generate contextual follow-up questions
  const followUpSuggestions = React.useMemo(() => {
    if (isUser || !message.content || message.abstention) return [];
    const text = message.content.toLowerCase();
    const suggestions: string[] = [];

    if (text.includes('summary') || text.includes('document') || text.includes('key')) {
      suggestions.push('Can you elaborate on the key findings?');
      suggestions.push('What are the practical implications?');
    } else if (text.includes('architecture') || text.includes('technical') || text.includes('system')) {
      suggestions.push('What are the architectural trade-offs?');
      suggestions.push('Explain the data flow in detail.');
    } else {
      suggestions.push('What additional details are supported by this document?');
      suggestions.push('Can you provide specific citations or quotes?');
    }

    return suggestions.slice(0, 2);
  }, [isUser, message.content, message.abstention]);

  if (isUser) {
    return (
      <div className="flex justify-end py-2">
        <div className="flex items-start gap-3 max-w-[85%] md:max-w-[75%]">
          <div className="bg-gradient-to-r from-[#5920B5] to-[#7C3AED] text-white rounded-2xl rounded-tr-sm px-4.5 py-3 text-sm shadow-purple font-normal leading-relaxed">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#5920B5] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-[#DDD6FE]">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  const sources = message.sources || [];

  return (
    <div className="flex items-start gap-3.5 py-3 group">
      {/* Bot Avatar Icon */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5920B5] to-[#8B5CF6] text-white flex items-center justify-center shadow-purple shrink-0 mt-1">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-3 bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] rounded-2xl p-5 shadow-card">
        {/* Header: Name, Model, Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#17152B] dark:text-white">
              DocuMind AI
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#A78BFA] border border-[#E8E1F2] dark:border-[#3E3065]">
              Llama 3.2 • Grounded RAG
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="p-1.5 text-[#77738A] hover:text-[#5920B5] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] rounded-lg transition-colors"
              title="Copy answer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Regenerate Answer Button */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 text-[#77738A] hover:text-[#5920B5] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] rounded-lg transition-colors"
                title="Regenerate answer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Feedback Controls (Thumbs Up / Down) */}
            <button
              onClick={() => handleFeedback('liked')}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'liked'
                  ? 'text-[#16A34A] bg-[#DCFCE7] dark:bg-[#143E24]'
                  : 'text-[#77738A] hover:text-[#16A34A] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047]'
              }`}
              title="Helpful response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleFeedback('disliked')}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'disliked'
                  ? 'text-[#DC2626] bg-[#FEE2E2] dark:bg-[#3D1414]'
                  : 'text-[#77738A] hover:text-[#DC2626] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047]'
              }`}
              title="Not helpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Abstention Warning Banner (if RAG confidence fell below threshold) */}
        {message.abstention && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Confidence Threshold Caveat</p>
              <p className="mt-0.5 opacity-90 leading-relaxed">
                The retrieved context chunks fell below the strict evidence threshold. The answer was abstained or heavily qualified to guarantee zero hallucinations.
              </p>
            </div>
          </div>
        )}

        {/* Markdown Answer Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-[#17152B] dark:text-[#F5F3FF] text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>

          {/* Streaming pulsing indicator */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-[#8B5CF6] animate-pulse align-middle rounded-sm" />
          )}
        </div>

        {/* Source Document Citations with Referenced Page Numbers */}
        {sources.length > 0 && (
          <div className="pt-3 border-t border-[#E8E1F2] dark:border-[#352B52] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#77738A] dark:text-[#A39EB8]">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#5920B5] dark:text-[#A78BFA]" />
                Referenced Document Citations ({sources.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sources.map((src, idx) => {
                const isExpanded = expandedCitation === src.chunk_id;
                const pageLabel = src.page_number ? `Page ${src.page_number}` : 'Page 1';
                const scoreLabel = `${(src.score * 100).toFixed(0)}% Match`;
                const snippet = src.snippet || src.content_snippet || 'Document context excerpt used in synthesis.';

                return (
                  <div
                    key={src.chunk_id || idx}
                    className="p-2.5 rounded-xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] hover:border-[#8B5CF6] transition-all text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        onClick={() => navigate(`/documents/${src.document_id}${src.page_number ? `?page=${src.page_number}` : ''}`)}
                        className="flex items-center gap-2 truncate cursor-pointer group/cite"
                        title={src.filename}
                      >
                        <FileText className="w-3.5 h-3.5 text-[#5920B5] shrink-0" />
                        <span className="font-semibold text-[#17152B] dark:text-[#F5F3FF] truncate group-hover/cite:text-[#5920B5]">
                          {src.filename}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F0EBFA] text-[#5920B5] dark:bg-[#2A2047] dark:text-[#C4B5FD]">
                          {pageLabel}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {scoreLabel}
                        </span>
                      </div>
                    </div>

                    {/* Excerpt toggle */}
                    <div className="mt-1.5 pt-1.5 border-t border-[#E8E1F2]/60 dark:border-[#352B52]/60 text-[11px] text-[#77738A] dark:text-[#A39EB8]">
                      <p className="line-clamp-2 italic">
                        "{snippet.slice(0, 120)}..."
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Suggested Follow-up Questions Chips */}
        {followUpSuggestions.length > 0 && isLatestAssistant && (
          <div className="pt-3 border-t border-[#E8E1F2] dark:border-[#352B52] space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#77738A]">
              Suggested Follow-ups
            </span>
            <div className="flex flex-wrap gap-2">
              {followUpSuggestions.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt?.(prompt)}
                  className="px-3 py-1.5 rounded-xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] hover:border-[#8B5CF6] text-xs font-medium text-[#17152B] dark:text-[#E2DCF0] flex items-center gap-1.5 transition-all active:scale-98"
                >
                  <span>{prompt}</span>
                  <ArrowRight className="w-3 h-3 text-[#5920B5] dark:text-[#A78BFA]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Telemetry & Performance Expansion */}
        {message.total_latency_ms !== undefined && (
          <div className="pt-2 border-t border-[#E8E1F2] dark:border-[#352B52] flex items-center justify-between text-[11px] text-[#77738A] dark:text-[#A39EB8]">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3 h-3 text-[#5920B5]" />
              <span>{(message.total_latency_ms / 1000).toFixed(2)}s total</span>
              {message.metadata?.llm_ttft_ms !== undefined && (
                <span>• TTFT: {message.metadata.llm_ttft_ms.toFixed(0)}ms</span>
              )}
            </div>

            <button
              onClick={() => setShowPerf(!showPerf)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#5920B5] dark:text-[#A78BFA] hover:underline"
            >
              <span>{showPerf ? 'Hide Telemetry' : 'View Telemetry'}</span>
              {showPerf ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        )}

        {showPerf && message.metadata && (
          <div className="mt-2 p-3 rounded-xl bg-[#FAF8FD] dark:bg-[#150F24] border border-[#E8E1F2] dark:border-[#352B52] text-[11px] font-mono grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-[#77738A] block text-[10px]">Retrieval Time</span>
              <span className="font-bold text-[#17152B] dark:text-white">
                {message.retrieval_latency_ms !== undefined ? `${message.retrieval_latency_ms.toFixed(1)}ms` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[#77738A] block text-[10px]">Generation Time</span>
              <span className="font-bold text-[#17152B] dark:text-white">
                {message.generation_latency_ms !== undefined ? `${(message.generation_latency_ms / 1000).toFixed(2)}s` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[#77738A] block text-[10px]">Generated Tokens</span>
              <span className="font-bold text-[#17152B] dark:text-white">
                {message.metadata?.generated_tokens ?? 'N/A'} tokens
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
