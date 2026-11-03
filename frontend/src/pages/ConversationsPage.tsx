import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  ArrowRight,
  Download,
  Check,
  X,
  History,
} from 'lucide-react';
import { chatService } from '../services/chatService';
import { Conversation } from '../types/chat';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';

export const ConversationsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.listConversations(),
  });

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    try {
      await chatService.renameConversation(id, editTitle.trim());
      success('Conversation Renamed', `Updated to "${editTitle.trim()}".`);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setEditingId(null);
    } catch (err: any) {
      error('Rename Failed', err.message || 'Could not rename conversation');
    }
  };

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete conversation "${title}"?`)) return;
    try {
      await chatService.deleteConversation(id);
      success('Conversation Deleted', 'Chat history was removed.');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (err: any) {
      error('Delete Failed', err.message || 'Could not delete conversation');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#17152B] dark:text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#5920B5]" />
            <span>Conversation History</span>
          </h1>
          <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-1 font-medium">
            Search, revisit, and manage your past grounded Q&A threads and AI insights
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/chat')}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-purple hover:shadow-purple-lg"
        >
          New Conversation
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#1E1733] rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#77738A] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations by title or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#FAF8FD] dark:bg-[#150F24] border border-[#E8E1F2] dark:border-[#352B52] text-[#17152B] dark:text-[#F5F3FF] placeholder-[#77738A]/70 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
          />
        </div>
        <span className="text-xs text-[#77738A] dark:text-[#A39EB8] ml-auto">
          {filtered.length} conversations found
        </span>
      </div>

      {/* Conversations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border-2 border-dashed border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card space-y-3">
          <MessageSquare className="w-12 h-12 text-[#5920B5] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#17152B] dark:text-white">
            No conversations found
          </h3>
          <p className="text-xs text-[#77738A] dark:text-[#A39EB8] max-w-sm mx-auto">
            {searchTerm
              ? 'Try modifying your search query.'
              : 'Start your first chat with DocuMind AI to build conversation history.'}
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={() => navigate('/chat')} leftIcon={<Plus className="w-4 h-4" />}>
              Start First Chat
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((conv) => {
            const isEditing = editingId === conv.id;
            const messageCount = conv.messages?.length || 0;
            const firstMsg = conv.messages && conv.messages[0]?.content;
            const preview = firstMsg
              ? firstMsg.slice(0, 110) + (firstMsg.length > 110 ? '...' : '')
              : 'Grounded conversation thread';

            return (
              <Card
                key={conv.id}
                hoverable
                onClick={() => navigate(`/chat/${conv.id}`)}
                className="p-5 flex flex-col justify-between group cursor-pointer border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card hover:border-[#8B5CF6] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0EBFA] text-[#5920B5] dark:bg-[#2A2047] dark:text-[#C4B5FD] border border-[#E8E1F2]">
                      {messageCount} messages
                    </span>
                    <span className="text-[11px] text-[#77738A] dark:text-[#A39EB8]">
                      {formatDate(conv.updated_at || conv.created_at)}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 my-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-[#FAF8FD] border border-[#8B5CF6] rounded-lg text-[#17152B] focus:outline-none"
                      />
                      <button
                        onClick={(e) => saveRename(conv.id, e)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="p-1 text-[#77738A]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-sm font-bold text-[#17152B] dark:text-[#F5F3FF] line-clamp-2 group-hover:text-[#5920B5] dark:group-hover:text-[#A78BFA] transition-colors mb-2">
                      {conv.title}
                    </h3>
                  )}

                  <p className="text-xs text-[#77738A] dark:text-[#A39EB8] line-clamp-3 leading-relaxed">
                    {preview}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-[#E8E1F2] dark:border-[#352B52] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#5920B5] dark:text-[#A78BFA] flex items-center gap-1 group-hover:underline">
                    <span>Continue Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => startRename(conv, e)}
                      className="p-1.5 rounded-lg text-[#77738A] hover:text-[#5920B5] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(conv.id, conv.title, e)}
                      className="p-1.5 rounded-lg text-[#77738A] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
