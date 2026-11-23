import React, { useState, useRef, useEffect } from 'react';
import { Layers, Check, ChevronDown, X } from 'lucide-react';
import { DocumentItem } from '../../types/document';
import { useChatSettings } from '../../context/ChatSettingsContext';

interface DocumentScopeSelectorProps {
  documents: DocumentItem[];
}

export const DocumentScopeSelector: React.FC<DocumentScopeSelectorProps> = ({ documents }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { scopeDocumentIds, toggleScopeDocumentId, clearScope } = useChatSettings();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAll = scopeDocumentIds.length === 0;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#202124] text-xs font-semibold text-[#202124] dark:text-[#FFFDF5] hover:border-[#E8BD42] transition-colors shadow-xs"
      >
        <Layers className="w-3.5 h-3.5 text-[#4D9B45]" />
        <span>
          {isAll
            ? 'Scope: All Documents'
            : `Scoped: ${scopeDocumentIds.length} doc${scopeDocumentIds.length > 1 ? 's' : ''}`}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#77746B]" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-80 rounded-2xl bg-white dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] shadow-card z-50 p-2.5 space-y-1">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#E9E1CC] dark:border-[#303238]">
            <span className="text-[11px] font-bold text-[#77746B] dark:text-[#A8A499] uppercase tracking-wider">
              Filter Document Scope
            </span>
            {!isAll && (
              <button
                onClick={clearScope}
                className="text-[11px] text-[#245B32] dark:text-[#FFE89A] hover:underline font-semibold"
              >
                Reset to All
              </button>
            )}
          </div>

          <button
            onClick={clearScope}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
              isAll
                ? 'bg-[#FFF9E8] text-[#202124] dark:bg-[#303238] dark:text-white font-bold border-l-2 border-[#E8BD42]'
                : 'text-[#202124] dark:text-[#E9E1CC] hover:bg-[#FFFDF5] dark:hover:bg-[#2A2B2E]'
            }`}
          >
            <span>All Uploaded Documents (Global Search)</span>
            {isAll && <Check className="w-4 h-4 text-[#4D9B45]" />}
          </button>

          <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
            {documents.map((doc) => {
              const isSelected = scopeDocumentIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleScopeDocumentId(doc.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                    isSelected
                      ? 'bg-[#FFF9E8] text-[#202124] dark:bg-[#303238] dark:text-white font-semibold border-l-2 border-[#E8BD42]'
                      : 'text-[#202124] dark:text-[#E9E1CC] hover:bg-[#FFFDF5] dark:hover:bg-[#2A2B2E]'
                  }`}
                >
                  <span className="truncate pr-2">{doc.filename}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#4D9B45] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
