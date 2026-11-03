import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  MessageSquare,
  Layers,
  Zap,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Search,
  MoreVertical,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { chatService } from '../services/chatService';
import { analyticsService } from '../services/analyticsService';
import { StatMetricCard } from '../components/analytics/StatMetricCard';
import { KnowledgeActivityChart } from '../components/analytics/KnowledgeActivityChart';
import { DocDistributionChart } from '../components/analytics/DocDistributionChart';
import { SystemStatusCard } from '../components/dashboard/SystemStatusCard';
import { DocumentTable } from '../components/documents/DocumentTable';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { useToast } from '../components/common/Toast';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeChatMenuId, setActiveChatMenuId] = useState<string | null>(null);

  // Close chat menu on outside click
  useEffect(() => {
    const handleOutside = () => setActiveChatMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const { data: docData, isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.listDocuments(),
  });

  const { data: convData, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.listConversations(),
  });

  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => analyticsService.getStats(),
  });

  const documents = docData?.documents || [];
  const conversations = convData || [];
  const overview = statsData?.overview;
  const docTypes = statsData?.document_types || {};

  // Dynamic greeting based on current time
  const currentHour = new Date().getHours();
  const greetingTime =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 18
      ? 'Good Afternoon'
      : 'Good Evening';

  const userName = 'Alex Morgan';

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    setActiveChatMenuId(null);
    if (!window.confirm('Delete this conversation history?')) return;
    try {
      await chatService.deleteConversation(convId);
      success('Conversation Deleted', 'Chat history was removed.');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-stats'] });
    } catch (err: any) {
      error('Delete Failed', err.message || 'Could not delete conversation');
    }
  };

  return (
    <div className="w-full p-4 sm:p-5 lg:p-6 space-y-5">
      {/* ROW 1 – WELCOME BANNER (FULL WIDTH) */}
      <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5920B5] via-[#6D28D9] to-[#8B5CF6] text-white p-5 md:p-6 shadow-purple">
        {/* Ambient atmospheric glows */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-56 h-56 bg-[#C4B5FD]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Left Section: Greeting & Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#DDD6FE]" />
              <span>Document Intelligence & Local RAG</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              {greetingTime}, {userName}!
            </h1>
            <p className="text-xs md:text-sm text-[#E2DCF0] font-normal leading-relaxed max-w-xl">
              Your AI-powered document intelligence workspace. Ask grounded questions, inspect semantic chunks, and manage enterprise knowledge.
            </p>
          </div>

          {/* Middle Section: Document Intelligence Illustration */}
          <div className="hidden lg:flex items-center justify-center relative shrink-0 px-4 py-1 select-none">
            <div className="relative w-48 h-28 flex items-center justify-center">
              {/* Ambient radial aura */}
              <div className="absolute inset-0 bg-[#A78BFA]/20 rounded-full blur-xl pointer-events-none" />

              {/* Vector Architecture Graphic */}
              <svg className="w-44 h-26 relative z-10" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Neural Connection Lines */}
                <path d="M 35 30 Q 90 15 145 35" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M 35 75 Q 90 95 145 70" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M 90 15 L 90 95" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />

                {/* Floating Node 1: pgvector */}
                <g>
                  <circle cx="35" cy="30" r="13" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  <rect x="29" y="24" width="12" height="12" rx="2" fill="#8B5CF6" />
                  <path d="M 32 30 L 38 30 M 35 27 L 35 33" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                </g>

                {/* Central Floating Document Card */}
                <g transform="translate(68, 18)">
                  <rect width="44" height="60" rx="5" fill="rgba(255,255,255,0.95)" />
                  <rect x="7" y="10" width="30" height="4" rx="2" fill="#5920B5" />
                  <rect x="7" y="18" width="22" height="2.5" rx="1.2" fill="#C4B5FD" />
                  <rect x="7" y="24" width="26" height="2.5" rx="1.2" fill="#E2DCF0" />
                  <rect x="7" y="30" width="18" height="2.5" rx="1.2" fill="#E2DCF0" />
                  <rect x="7" y="36" width="28" height="2.5" rx="1.2" fill="#E2DCF0" />
                  {/* Verified badge */}
                  <circle cx="34" cy="48" r="6" fill="#16A34A" />
                  <path d="M 32 48 L 33.5 49.5 L 36.5 46.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* Floating Node 2: Llama 3.2 AI */}
                <g>
                  <circle cx="145" cy="35" r="13" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  <circle cx="145" cy="35" r="7" fill="#6D28D9" />
                  <circle cx="145" cy="35" r="3" fill="#DDD6FE" />
                </g>

                {/* Floating Node 3: Semantic Vectors */}
                <g>
                  <circle cx="35" cy="75" r="11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <path d="M 31 75 L 39 75 M 35 71 L 35 79" stroke="#E2DCF0" strokeWidth="1" />
                </g>

                {/* Floating Node 4: Grounded Q&A */}
                <g>
                  <circle cx="145" cy="70" r="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <path d="M 140 70 L 150 70 M 145 66 L 148 70 L 145 74" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* Sparkles */}
                <path d="M 58 12 L 60 16 L 64 18 L 60 20 L 58 24 L 56 20 L 52 18 L 56 16 Z" fill="#DDD6FE" />
                <path d="M 122 80 L 123.5 83 L 126.5 84.5 L 123.5 86 L 122 89 L 120.5 86 L 117.5 84.5 L 120.5 83 Z" fill="#DDD6FE" />
              </svg>

              {/* Floating Mini Badges */}
              <div className="absolute -bottom-1 -left-1 bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-bold px-2 py-0.5 rounded-full text-white">
                pgvector Active
              </div>
              <div className="absolute -top-1 -right-1 bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-bold px-2 py-0.5 rounded-full text-white">
                Llama 3.2
              </div>
            </div>
          </div>

          {/* Right Section: 3 Action Buttons */}
          <div className="shrink-0 flex flex-col sm:flex-row xl:flex-col gap-2 justify-center pt-2 xl:pt-0">
            <button
              onClick={() => navigate('/chat')}
              className="py-2 px-3.5 rounded-xl bg-white text-[#5920B5] hover:bg-[#FAF8FD] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#5920B5] shrink-0" />
              <span>Start New Chat</span>
            </button>
            <button
              onClick={() => setUploadOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Upload Document</span>
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Browse Documents</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2 – KPI STATISTICS (4 EQUAL WIDTH COLUMNS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full items-stretch">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : (
          <>
            {/* 1. Total Documents */}
            <StatMetricCard
              title="Total Documents"
              value={overview?.total_documents ?? documents.length}
              subtitle="Uploaded files"
              icon={FileText}
              iconGradient="from-[#5920B5] to-[#7C3AED]"
              trend="+12% week"
              onClick={() => navigate('/documents')}
            />

            {/* 2. Indexed Chunks */}
            <StatMetricCard
              title="Indexed Chunks"
              value={overview?.total_chunks ?? 0}
              subtitle="pgvector chunks"
              icon={Layers}
              iconGradient="from-[#7C3AED] to-[#8B5CF6]"
              trend="+18% week"
              onClick={() => navigate('/knowledge-base')}
            />

            {/* 3. Questions Answered */}
            <StatMetricCard
              title="Questions Answered"
              value={overview?.total_queries ?? 0}
              subtitle="Grounded Q&A"
              icon={MessageSquare}
              iconGradient="from-[#8B5CF6] to-[#A78BFA]"
              trend="+24% week"
              onClick={() => navigate('/conversations')}
            />

            {/* 4. Accuracy */}
            <StatMetricCard
              title="Accuracy"
              value={`${overview?.success_rate ?? 98.4}%`}
              subtitle="Grounding rate"
              icon={Zap}
              iconGradient="from-[#16A34A] to-[#22C55E]"
              badge="100% Grounded"
              trend="Optimal"
              onClick={() => navigate('/analytics')}
            />
          </>
        )}
      </div>

      {/* ROW 3 – ANALYTICS AND SYSTEM HEALTH (45% / 25% / 30%) */}
      <div className="flex flex-col lg:flex-row gap-4 w-full items-stretch">
        {/* Component 1: Knowledge Activity – 45% width */}
        <div className="w-full lg:flex-[45_1_0%] min-w-0 flex flex-col">
          <KnowledgeActivityChart
            activityTimeline={statsData?.activity_timeline}
            documents={documents}
            conversations={conversations}
            isLoading={statsLoading}
            error={statsError as Error | null}
          />
        </div>

        {/* Component 2: Document Types – 25% width */}
        <div className="w-full lg:flex-[25_1_0%] min-w-0 flex flex-col">
          <DocDistributionChart
            distribution={statsData?.document_distribution || docTypes}
            isLoading={statsLoading}
            error={statsError as Error | null}
            onUploadClick={() => setUploadOpen(true)}
          />
        </div>

        {/* Component 3: System Health – 30% width */}
        <div className="w-full lg:flex-[30_1_0%] min-w-0 flex flex-col">
          <SystemStatusCard />
        </div>
      </div>

      {/* ROW 4 – RECENT DATA (60% / 40%) */}
      <div className="flex flex-col lg:flex-row gap-4 w-full items-stretch">
        {/* Component 1: Recent Documents – 60% width */}
        <div className="w-full lg:flex-[60_1_0%] min-w-0 flex flex-col space-y-2">
          <div className="flex items-center justify-between h-8">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#17152B] dark:text-white">
                Recent Documents
              </h2>
              <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8] truncate">
                Most recently uploaded files and their pgvector indexing status
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/documents')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#5920B5] dark:text-[#A78BFA]" />}
              className="text-xs text-[#5920B5] dark:text-[#A78BFA] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] shrink-0 h-8 px-2.5"
            >
              View All ({documents.length})
            </Button>
          </div>

          {docsLoading ? (
            <Skeleton className="h-56 rounded-2xl" />
          ) : documents.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] flex-1 flex flex-col items-center justify-center">
              <FileText className="w-10 h-10 text-[#5920B5] mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-[#17152B] dark:text-white">
                No documents uploaded yet
              </h4>
              <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-1 max-w-sm mx-auto">
                Upload your first PDF, DOCX, TXT, or Markdown document to index semantic chunks.
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setUploadOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Upload First Document
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex-1">
              <DocumentTable
                documents={documents}
                enableSearch={false}
                enablePagination={true}
                pageSize={4}
                compact={true}
              />
            </div>
          )}
        </div>

        {/* Component 2: Recent Chats – 40% width */}
        <div className="w-full lg:flex-[40_1_0%] min-w-0 flex flex-col space-y-2">
          <div className="flex items-center justify-between h-8">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#17152B] dark:text-white">
                Recent Chats
              </h2>
              <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8] truncate">
                Past conversations & grounded queries
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/conversations')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#5920B5] dark:text-[#A78BFA]" />}
              className="text-xs text-[#5920B5] dark:text-[#A78BFA] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] shrink-0 h-8 px-2.5"
            >
              View All
            </Button>
          </div>

          <Card className="border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card divide-y divide-[#E8E1F2] dark:divide-[#352B52] flex-1 flex flex-col justify-between">
            {convsLoading ? (
              <div className="p-3 space-y-2.5">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#77738A] dark:text-[#A39EB8] space-y-2.5 my-auto">
                <MessageSquare className="w-8 h-8 text-[#8B5CF6] mx-auto opacity-70" />
                <p>No chat history yet. Ask a question to start an intelligent conversation.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/chat')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Start New Chat
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#E8E1F2] dark:divide-[#352B52]">
                {conversations.slice(0, 4).map((conv) => {
                  const latestMsg = conv.messages && conv.messages.length > 0
                    ? conv.messages[conv.messages.length - 1]
                    : null;
                  const previewText = latestMsg
                    ? latestMsg.content.slice(0, 60) + (latestMsg.content.length > 60 ? '...' : '')
                    : 'Start of conversation...';
                  const isMenuOpen = activeChatMenuId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => navigate(`/chat/${conv.id}`)}
                      className="p-3 hover:bg-[#FAF8FD] dark:hover:bg-[#1A132C] cursor-pointer transition-colors flex items-center justify-between gap-3 group relative"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#A78BFA] flex items-center justify-center shrink-0 group-hover:bg-[#5920B5] group-hover:text-white transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#17152B] dark:text-[#F5F3FF] truncate group-hover:text-[#5920B5] dark:group-hover:text-[#A78BFA] transition-colors">
                            {conv.title}
                          </p>
                          <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8] truncate mt-0.5">
                            {previewText}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-[#77738A]">
                          {formatRelativeTime(conv.updated_at || conv.created_at)}
                        </span>

                        {/* More options button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveChatMenuId(isMenuOpen ? null : conv.id);
                            }}
                            className="p-1 text-[#77738A] hover:text-[#17152B] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                            title="More options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-7 w-36 bg-white dark:bg-[#1E1733] border border-[#E8E1F2] dark:border-[#352B52] shadow-purple-lg rounded-xl py-1 z-30 text-left"
                            >
                              <button
                                onClick={() => {
                                  setActiveChatMenuId(null);
                                  navigate(`/chat/${conv.id}`);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#17152B] dark:text-[#F5F3FF] hover:bg-[#F0EBFA] dark:hover:bg-[#2A2047] transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 text-[#5920B5]" />
                                <span>Open Chat</span>
                              </button>
                              <button
                                onClick={(e) => handleDeleteConversation(e, conv.id)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  );
};
