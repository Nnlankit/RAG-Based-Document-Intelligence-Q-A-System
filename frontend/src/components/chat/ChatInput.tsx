import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Sparkles, SlidersHorizontal } from 'lucide-react';
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
    <div className="p-4 md:px-8 border-t border-[#D4C3A5] dark:border-[#524436] bg-[#F2E9D8]/80 dark:bg-[#261F1A]/80 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
        {/* Main Input Box */}
        <div className="relative rounded-2xl border border-[#CDBB9D] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] shadow-card focus-within:ring-2 focus-within:ring-[#8B6F52] focus-within:border-[#8B6F52] transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents (e.g., 'What are the main findings in Section 3?')..."
            disabled={isLoading}
            className="w-full px-4 pt-3.5 pb-2 text-sm bg-transparent text-[#30261E] dark:text-[#F7F0E3] placeholder-[#6B5C4D]/80 dark:placeholder-[#B9A995]/80 focus:outline-none resize-none max-h-40 min-h-[48px]"
          />

          {/* Bottom Bar inside input */}
          <div className="px-3 pb-2.5 pt-1 flex items-center justify-between gap-2 border-t border-[#D4C3A5]/50 dark:border-[#524436]/50">
            {/* Scope filter selector */}
            <DocumentScopeSelector documents={documents} />

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] font-mono text-[#5A4634] dark:text-[#DCC9AA] font-medium">
                Thresh: {similarityThreshold} • Top-{topK}
              </span>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!text.trim() || isLoading}
                isLoading={isLoading}
                className="rounded-xl px-3 h-8 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Small footer note */}
        <p className="text-[11px] text-center text-[#5A4634] dark:text-[#DCC9AA] font-medium select-none">
          Grounded answers generated via local Llama 3.2. Evidence threshold enforced to prevent hallucinations.
        </p>
      </form>
    </div>
  );
};
