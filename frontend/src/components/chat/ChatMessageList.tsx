import React, { useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, BookOpen, Layers, Cpu, ArrowRight } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectPrompt?: (prompt: string) => void;
  onRegenerate?: () => void;
  onRetry?: (messageId?: string) => void;
  isStreaming?: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  onSelectPrompt,
  onRegenerate,
  onRetry,
  isStreaming = false,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const hasPendingAssistant = messages.some(
    (m) => m.role === 'assistant' && m.status === 'pending'
  );

  const starterPrompts = [
    {
      title: 'Summarize Document',
      prompt: 'Provide a comprehensive summary of the uploaded document with key takeaways and executive highlights.',
      icon: BookOpen,
    },
    {
      title: 'Extract Core Skills & Topics',
      prompt: 'What are the main technical skills, frameworks, and domain expertise mentioned in the document?',
      icon: Sparkles,
    },
    {
      title: 'Key Questions & Insights',
      prompt: 'What are the 5 most critical insights or findings discussed in the document?',
      icon: Layers,
    },
  ];

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#5920B5] to-[#8B5CF6] text-white flex items-center justify-center shadow-purple-lg mb-4">
          <Sparkles className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-extrabold text-[#17152B] dark:text-white tracking-tight">
          Ask DocuMind AI
        </h3>
        <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-1.5 max-w-md leading-relaxed">
          Natural-language Q&A grounded in your uploaded documents. Powered by local Llama 3.2 and dense pgvector search with zero hallucinations.
        </p>

        {/* Prompt suggestion cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-8">
          {starterPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt?.(item.prompt)}
                className="p-4 rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] hover:border-[#8B5CF6] hover:shadow-card-hover text-left transition-all duration-150 group shadow-card"
              >
                <div className="w-8 h-8 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#A78BFA] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#17152B] dark:text-white mb-1 group-hover:text-[#5920B5] dark:group-hover:text-[#A78BFA] transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8] line-clamp-2">
                  {item.prompt}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
      {messages.map((msg, index) => {
        const isLatestAssistant =
          msg.role === 'assistant' &&
          (index === messages.length - 1 ||
            (index === messages.length - 2 && messages[messages.length - 1].role === 'user'));

        return (
          <ChatMessageItem
            key={msg.id || `msg-${index}`}
            message={msg}
            isLatestAssistant={isLatestAssistant}
            onRegenerate={onRegenerate}
            onRetry={() => onRetry?.(msg.id)}
            isStreaming={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
          />
        );
      })}

      {/* Thinking / Loading indicator (only if no pending assistant bubble in state) */}
      {isLoading && !hasPendingAssistant && (
        <div className="flex items-start gap-3.5 py-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5920B5] to-[#8B5CF6] text-white flex items-center justify-center shadow-purple shrink-0 animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2.5 px-4.5 py-3 rounded-2xl bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] text-xs text-[#5920B5] dark:text-[#A78BFA] shadow-card font-semibold">
            <span className="flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-[#5920B5] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span>Retrieving chunks & generating grounded answer with Llama 3.2...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
