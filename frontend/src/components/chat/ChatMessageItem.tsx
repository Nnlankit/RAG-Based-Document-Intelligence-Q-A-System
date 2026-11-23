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
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, SourceAttribution } from '../../types/chat';
import { useToast } from '../common/Toast';

interface ChatMessageItemProps {
  message: ChatMessage;
  isLatestAssistant?: boolean;
  onRegenerate?: () => void;
  isStreaming?: boolean;
  onRetry?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isLatestAssistant = false,
  onRegenerate,
  isStreaming = false,
  onRetry,
}) => {
  const navigate = useNavigate();
  const { success, info } = useToast();
  const isUser = message.role === 'user';

  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const [showPerf, setShowPerf] = useState(false);

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


  if (isUser) {
    return (
      <div className="flex justify-end py-2">
        <div className="flex items-start gap-3 max-w-[85%] md:max-w-[75%]">
          <div className="bg-[#202124] text-white rounded-2xl rounded-tr-sm px-4.5 py-3 text-sm shadow-subtle font-normal leading-relaxed">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#303238] text-[#FFE89A] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-[#484A50]">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex items-start gap-3.5 py-3 group">
      {/* Bot Avatar Icon */}
      <div className="w-8 h-8 rounded-xl bg-[#202124] text-[#FFE89A] border border-[#303238] flex items-center justify-center shadow-subtle shrink-0 mt-1">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-3 bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] rounded-2xl p-5 shadow-card">
        {/* Header: Name, Model, Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#202124] dark:text-white">
              DocuMind AI
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E5F4DC] dark:bg-[#245B32]/40 text-[#245B32] dark:text-[#DDF2C1] border border-[#DDF2C1] dark:border-[#245B32]">
              Llama 3.2 • Grounded RAG
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="p-1.5 text-[#77746B] hover:text-[#202124] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-lg transition-colors"
              title="Copy answer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#4D9B45]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Regenerate Answer Button */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 text-[#77746B] hover:text-[#202124] hover:bg-[#FFF9E8] dark:hover:bg-[#303238] rounded-lg transition-colors"
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
                  ? 'text-[#245B32] bg-[#E5F4DC] border border-[#DDF2C1]'
                  : 'text-[#77746B] hover:text-[#4D9B45] hover:bg-[#FFF9E8] dark:hover:bg-[#303238]'
              }`}
              title="Helpful response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleFeedback('disliked')}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'disliked'
                  ? 'text-[#C94B4B] bg-[#FCE8E8] border border-[#FAD2D2]'
                  : 'text-[#77746B] hover:text-[#C94B4B] hover:bg-[#FFF9E8] dark:hover:bg-[#303238]'
              }`}
              title="Not helpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Abstention Warning Banner (if RAG confidence fell below threshold) */}
        {message.abstention && (
          <div className="p-3.5 rounded-xl bg-[#FFF1CC] dark:bg-[#D99A24]/20 border border-[#FFE89A] dark:border-[#D99A24]/40 flex items-start gap-2.5 text-[#D99A24] dark:text-[#FFE89A] text-xs">
            <AlertTriangle className="w-4 h-4 text-[#D99A24] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Confidence Threshold Caveat</p>
              <p className="mt-0.5 opacity-90 leading-relaxed">
                The retrieved context chunks fell below the strict evidence threshold. The answer was abstained or heavily qualified to guarantee zero hallucinations.
              </p>
            </div>
          </div>
        )}

        {/* Error / Failed State */}
        {message.status === 'failed' && (
          <div className="p-3.5 rounded-xl bg-[#FCE8E8] dark:bg-[#C94B4B]/20 border border-[#FAD2D2] dark:border-[#C94B4B]/40 flex items-center justify-between gap-3 text-[#C94B4B] dark:text-[#FCA5A5] text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C94B4B] shrink-0" />
              <span>{message.error || 'Failed to generate response. Please try again.'}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 bg-[#C94B4B] hover:bg-[#B33E3E] text-white rounded-lg font-medium text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Thinking / Pending State without tokens yet */}
        {message.status === 'pending' && !message.content && (
          <div className="flex items-center gap-2.5 py-2 text-xs text-[#202124] dark:text-[#DDF2C1] font-medium">
            <div className="flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-[#202124] dark:bg-[#DDF2C1] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#4D9B45] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#E8BD42] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>DocuMind AI is thinking & retrieving context...</span>
          </div>
        )}

        {/* Markdown Answer Content */}
        {message.content && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-[#202124] dark:text-[#FFFDF5] text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>

            {/* Streaming pulsing indicator */}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-[#4D9B45] animate-pulse align-middle rounded-sm" />
            )}
          </div>
        )}

        {/* Source Citations & References (Soft Green Indicators) */}
        {message.sources && message.sources.length > 0 && (
          <div className="pt-3 border-t border-[#E9E1CC] dark:border-[#303238] space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#77746B] dark:text-[#A8A499] uppercase tracking-wider">
              <span>Verified Sources & Citations</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1] text-xs font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4D9B45]" />
                  <span className="font-semibold truncate max-w-[200px]" title={src.filename}>
                    {src.filename || `Doc #${src.document_id?.slice(0, 8)}`}
                  </span>
                  {src.page_number && (
                    <span className="text-[10px] bg-white/70 px-1.5 py-0.5 rounded-md font-mono text-[#245B32]">
                      p. {src.page_number}
                    </span>
                  )}
                  {src.score !== undefined && (
                    <span className="text-[10px] text-[#4D9B45] font-mono">
                      {(src.score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Telemetry & Performance Expansion */}
        {message.total_latency_ms !== undefined && (
          <div className="pt-2 border-t border-[#E9E1CC] dark:border-[#303238] flex items-center justify-between text-[11px] text-[#77746B] dark:text-[#A8A499]">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3 h-3 text-[#4D9B45]" />
              <span>{(message.total_latency_ms / 1000).toFixed(2)}s total</span>
              {message.metadata?.llm_ttft_ms !== undefined && (
                <span>• TTFT: {message.metadata.llm_ttft_ms.toFixed(0)}ms</span>
              )}
            </div>

            <button
              onClick={() => setShowPerf(!showPerf)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#202124] dark:text-[#FFE89A] hover:underline"
            >
              <span>{showPerf ? 'Hide Telemetry' : 'View Telemetry'}</span>
              {showPerf ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        )}

        {showPerf && message.metadata && (
          <div className="mt-2 p-3 rounded-xl bg-[#FFF9E8] dark:bg-[#1A1A1C] border border-[#E9E1CC] dark:border-[#303238] text-[11px] font-mono grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-[#77746B] block text-[10px]">Retrieval Time</span>
              <span className="font-bold text-[#202124] dark:text-white">
                {message.retrieval_latency_ms !== undefined ? `${message.retrieval_latency_ms.toFixed(1)}ms` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[#77746B] block text-[10px]">Generation Time</span>
              <span className="font-bold text-[#202124] dark:text-white">
                {message.generation_latency_ms !== undefined ? `${(message.generation_latency_ms / 1000).toFixed(2)}s` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[#77746B] block text-[10px]">Generated Tokens</span>
              <span className="font-bold text-[#202124] dark:text-white">
                {message.metadata?.generated_tokens ?? 'N/A'} tokens
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
