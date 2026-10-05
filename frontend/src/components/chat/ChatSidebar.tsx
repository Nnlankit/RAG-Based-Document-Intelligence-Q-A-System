import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Conversation } from '../../types/chat';
import { Button } from '../common/Button';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const startEditing = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      onDeleteConversation(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#E2D3BB] dark:bg-[#261F1A] border-r border-[#D4C3A5] dark:border-[#524436] w-72 shrink-0 select-none">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[#D4C3A5]/60 dark:border-[#524436]/60 space-y-3">
        <Button
          variant="primary"
          onClick={onNewChat}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full justify-start rounded-xl font-medium shadow-xs py-2"
        >
          New Conversation
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5A4634] dark:text-[#DCC9AA] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#CDBB9D] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] text-[#30261E] dark:text-[#F7F0E3] placeholder-[#6B5C4D]/80 dark:placeholder-[#B9A995]/80 focus:outline-none focus:ring-1 focus:ring-[#8B6F52]"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#5A4634] dark:text-[#DCC9AA] font-medium">
            {conversations.length === 0 ? 'No conversations yet.' : 'No matching chats.'}
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = activeConversationId === conv.id;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#CDB795] text-[#30261E] dark:bg-[#3E3228] dark:text-[#F7F0E3] font-semibold shadow-xs'
                    : 'text-[#5A4634] dark:text-[#DCC9AA] hover:bg-[#E9DDC8] dark:hover:bg-[#342A22] hover:text-[#211B16] dark:hover:text-[#F7F0E3]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#5A4634] dark:text-[#DCC9AA]' : 'text-[#8B6F52] opacity-80'}`} />
                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(conv.id, e as any);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full px-1.5 py-0.5 text-xs bg-[#F7F0E3] dark:bg-[#342A22] border border-[#8B6F52] rounded text-[#30261E] dark:text-[#F7F0E3] focus:outline-none"
                    />
                  ) : (
                    <span className="truncate" title={conv.title}>
                      {conv.title}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 text-[#657A58] hover:text-[#4A5B40] rounded"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 text-[#5A4634] hover:text-[#30261E] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3] rounded"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                      <button
                        onClick={(e) => startEditing(conv, e)}
                        className="p-1 text-[#5A4634] hover:text-[#30261E] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3] rounded"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(conv.id, e)}
                        className="p-1 text-[#5A4634] hover:text-[#A65D50] dark:text-[#DCC9AA] dark:hover:text-[#A65D50] rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
