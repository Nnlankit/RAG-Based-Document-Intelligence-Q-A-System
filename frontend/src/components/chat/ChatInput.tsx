import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Sparkles, SlidersHorizontal, ArrowUp } from 'lucide-react';
import { Button } from '../common/Button';
import { DocumentScopeSelector } from './DocumentScopeSelector';
import { DocumentItem } from '../../types/document';
import { useChatSettings } from '../../context/ChatSettingsContext';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  documents: DocumentItem[];
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  documents,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { similarityThreshold, topK } = useChatSettings();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 md:px-8 border-t border-[#E8E1F2] dark:border-[#352B52] bg-white/95 dark:bg-[#1E1733]/95 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
        {/* Main Input Box */}
        <div className="relative rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] shadow-card focus-within:ring-2 focus-within:ring-[#8B5CF6] focus-within:border-[#8B5CF6] transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents (e.g. 'Summarize key findings with citations')..."
            disabled={isLoading}
            className="w-full px-4 pt-3.5 pb-2 text-sm bg-transparent text-[#17152B] dark:text-[#F5F3FF] placeholder-[#77738A]/70 focus:outline-none resize-none max-h-40 min-h-[50px]"
          />

          {/* Bottom Bar inside input */}
          <div className="px-3 pb-2.5 pt-1 flex items-center justify-between gap-2 border-t border-[#E8E1F2]/60 dark:border-[#352B52]/60">
            {/* Scope filter selector */}
            <DocumentScopeSelector documents={documents} />

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline-block text-[11px] font-mono text-[#77738A] dark:text-[#A39EB8]">
                Threshold: {similarityThreshold} • Top-{topK}
              </span>
              <button
                type="submit"
                disabled={!text.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-[#5920B5] hover:bg-[#481A94] disabled:opacity-40 text-white flex items-center justify-center shadow-purple transition-all active:scale-95"
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Small footer note */}
        <p className="text-[11px] text-center text-[#77738A] dark:text-[#A39EB8] select-none">
          100% grounded answers generated via local Llama 3.2. Vector context is retrieved with verified page citations.
        </p>
      </form>
    </div>
  );
};
