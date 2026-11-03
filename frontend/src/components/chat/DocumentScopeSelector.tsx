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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] text-xs font-semibold text-[#17152B] dark:text-[#F5F3FF] hover:border-[#8B5CF6] transition-colors shadow-xs"
      >
        <Layers className="w-3.5 h-3.5 text-[#5920B5] dark:text-[#A78BFA]" />
        <span>
          {isAll
            ? 'Scope: All Documents'
            : `Scoped: ${scopeDocumentIds.length} doc${scopeDocumentIds.length > 1 ? 's' : ''}`}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#77738A]" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-80 rounded-2xl bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] shadow-purple-lg z-50 p-2.5 space-y-1">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#E8E1F2] dark:border-[#352B52]">
            <span className="text-[11px] font-bold text-[#77738A] dark:text-[#A39EB8] uppercase tracking-wider">
              Filter Document Scope
            </span>
            {!isAll && (
              <button
                onClick={clearScope}
                className="text-[11px] text-[#5920B5] hover:underline font-semibold"
              >
                Reset to All
              </button>
            )}
          </div>

          <button
            onClick={clearScope}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
              isAll
                ? 'bg-[#F0EBFA] text-[#5920B5] dark:bg-[#2A2047] dark:text-[#DDD6FE] font-bold'
                : 'text-[#17152B] dark:text-[#E2DCF0] hover:bg-[#FAF8FD] dark:hover:bg-[#150F24]'
            }`}
          >
            <span>All Uploaded Documents (Global Search)</span>
            {isAll && <Check className="w-4 h-4 text-[#5920B5]" />}
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
                      ? 'bg-[#F0EBFA] text-[#5920B5] dark:bg-[#2A2047] dark:text-[#DDD6FE] font-semibold'
                      : 'text-[#17152B] dark:text-[#E2DCF0] hover:bg-[#FAF8FD] dark:hover:bg-[#150F24]'
                  }`}
                >
                  <span className="truncate pr-2">{doc.filename}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#5920B5] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
