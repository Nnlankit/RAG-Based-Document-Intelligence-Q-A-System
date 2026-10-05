import React, { useRef, useEffect } from 'react';
import { Cpu, Sparkles, MessageSquare, BookOpen, Layers } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectPrompt?: (prompt: string) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  onSelectPrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const starterPrompts = [
    {
      title: 'Summarize Document',
      prompt: 'Provide a comprehensive summary of the uploaded document with key takeaways.',
      icon: BookOpen,
    },
    {
      title: 'Extract Core Skills & Tech',
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
        <div className="w-14 h-14 rounded-2xl bg-[#5A4634] text-[#F7F0E3] flex items-center justify-center shadow-card mb-4">
          <Cpu className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-[#30261E] dark:text-[#F7F0E3]">
          Ask DocuMind AI
        </h3>
        <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-1 max-w-sm">
          Natural-language Q&A grounded in your uploaded documents. Powered by local Llama 3.2 and dense vector search with zero hallucinations.
        </p>

        {/* Prompt suggestion cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-8">
          {starterPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt?.(item.prompt)}
                className="p-3.5 rounded-xl border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] hover:border-[#8B6F52] dark:hover:border-[#8B6F52] hover:shadow-card text-left transition-all duration-150 group shadow-xs"
              >
                <Icon className="w-4 h-4 text-[#8B6F52] dark:text-[#D4A359] mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3] mb-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA] line-clamp-2">
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
      {messages.map((msg, index) => (
        <ChatMessageItem key={index} message={msg} />
      ))}

      {/* Thinking / Loading indicator */}
      {isLoading && (
        <div className="flex items-start gap-3 py-3">
          <div className="w-8 h-8 rounded-xl bg-[#5A4634] text-[#F7F0E3] flex items-center justify-center shadow-xs shrink-0 animate-pulse">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F7F0E3] dark:bg-[#2A221C] border border-[#D4C3A5] dark:border-[#4B3C2F] text-xs text-[#5A4634] dark:text-[#DCC9AA] shadow-xs font-medium">
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F52] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F52] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F52] animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span>Retrieving chunks & generating grounded answer...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
