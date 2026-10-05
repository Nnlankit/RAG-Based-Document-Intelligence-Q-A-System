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
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0] dark:bg-[#342A22] text-xs font-medium text-[#30261E] dark:text-[#F7F0E3] hover:bg-[#E5D6BD] dark:hover:bg-[#3D3128] transition-colors shadow-xs"
      >
        <Layers className="w-3.5 h-3.5 text-[#8B6F52]" />
        <span>
          {isAll
            ? 'Knowledge Scope: All Documents'
            : `Scoped: ${scopeDocumentIds.length} doc${scopeDocumentIds.length > 1 ? 's' : ''}`}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#5A4634] dark:text-[#DCC9AA]" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-72 rounded-xl bg-[#F7F0E3] dark:bg-[#2A221C] border border-[#D4C3A5] dark:border-[#524436] shadow-modal z-50 p-2 space-y-1">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#D4C3A5]/50 dark:border-[#524436]/50">
            <span className="text-[11px] font-semibold text-[#8B6F52] dark:text-[#CDB795] uppercase tracking-wider">
              Filter Document Scope
            </span>
            {!isAll && (
              <button
                onClick={clearScope}
                className="text-[11px] text-[#B87952] hover:text-[#8B6F52] dark:text-[#D4A359] font-medium"
              >
                Reset to All
              </button>
            )}
          </div>

          <button
            onClick={clearScope}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
              isAll
                ? 'bg-[#E1D2B8] text-[#5A4634] dark:bg-[#3E3228] dark:text-[#F7F0E3] font-medium'
                : 'text-[#30261E] dark:text-[#E8DCC8] hover:bg-[#EDE1CD] dark:hover:bg-[#342A22]'
            }`}
          >
            <span>All Uploaded Documents</span>
            {isAll && <Check className="w-4 h-4 text-[#8B6F52]" />}
          </button>

          <div className="max-h-48 overflow-y-auto space-y-0.5 pt-1">
            {documents.map((doc) => {
              const isSelected = scopeDocumentIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleScopeDocumentId(doc.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    isSelected
                      ? 'bg-[#E1D2B8] text-[#5A4634] dark:bg-[#3E3228] dark:text-[#F7F0E3] font-medium'
                      : 'text-[#30261E] dark:text-[#E8DCC8] hover:bg-[#EDE1CD] dark:hover:bg-[#342A22]'
                  }`}
                >
                  <span className="truncate pr-2">{doc.filename}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0 text-[#8B6F52]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
