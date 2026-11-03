import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Sparkles,
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
    if (window.confirm('Delete this conversation history?')) {
      onDeleteConversation(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF8FD] dark:bg-[#18112A] border-r border-[#E8E1F2] dark:border-[#352B52] w-72 shrink-0 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-[#E8E1F2] dark:border-[#352B52] space-y-3">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-3 rounded-xl bg-[#5920B5] hover:bg-[#481A94] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-purple transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#77738A] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] text-[#17152B] dark:text-[#F5F3FF] placeholder-[#77738A]/70 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#77738A] dark:text-[#A39EB8] font-medium space-y-1">
            <MessageSquare className="w-8 h-8 mx-auto text-[#8B5CF6] opacity-40 mb-2" />
            <p>{conversations.length === 0 ? 'No conversations yet.' : 'No matching chats.'}</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = activeConversationId === conv.id;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#5920B5] text-white font-semibold shadow-purple'
                    : 'text-[#17152B] dark:text-[#E2DCF0] hover:bg-[#F0EBFA] dark:hover:bg-[#251D3E]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#8B5CF6]'
                    }`}
                  />
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
                      className="w-full px-1.5 py-0.5 text-xs bg-white text-[#17152B] border border-[#8B5CF6] rounded-md focus:outline-none"
                    />
                  ) : (
                    <span className="truncate" title={conv.title}>
                      {conv.title}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 text-[#77738A] hover:text-[#17152B]"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                      <button
                        onClick={(e) => startEditing(conv, e)}
                        className={`p-1 rounded ${
                          isActive
                            ? 'text-white/80 hover:text-white'
                            : 'text-[#77738A] hover:text-[#5920B5]'
                        }`}
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(conv.id, e)}
                        className={`p-1 rounded ${
                          isActive
                            ? 'text-white/80 hover:text-red-200'
                            : 'text-[#77738A] hover:text-red-500'
                        }`}
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
