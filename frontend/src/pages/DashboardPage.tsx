import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  MessageSquare,
  Layers,
  Zap,
  Plus,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { chatService } from '../services/chatService';
import { analyticsService } from '../services/analyticsService';
import { StatMetricCard } from '../components/analytics/StatMetricCard';
import { DocumentCard } from '../components/documents/DocumentCard';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: docData, isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.listDocuments(),
  });

  const { data: convData, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.listConversations(),
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => analyticsService.getStats(),
  });

  const documents = docData?.documents || [];
  const conversations = convData || [];
  const overview = statsData?.overview;
  const performance = statsData?.performance;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-2xl bg-[#F7F0E3] dark:bg-[#342A22] text-[#30261E] dark:text-[#F7F0E3] shadow-card border border-[#D4C3A5] dark:border-[#524436]">
        {/* Subtle warm ambient lighting accents */}
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-[#B87952]/10 dark:bg-[#B87952]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-36 -bottom-12 w-44 h-44 bg-[#8B6F52]/10 dark:bg-[#8B6F52]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1D2B8] dark:bg-[#44362A] text-[#5A4634] dark:text-[#E8DCC8] text-xs font-semibold border border-[#CDBB9D] dark:border-[#5A4634] shadow-xs mb-1">
            <Cpu className="w-3.5 h-3.5 text-[#8B6F52] dark:text-[#CDB795]" />
            <span>Local AI • Grounded RAG Platform</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#30261E] dark:text-[#F7F0E3]">
            DocuMind AI Knowledge Workspace
          </h1>
          <p className="text-sm text-[#5A4634] dark:text-[#DCC9AA] font-normal leading-relaxed">
            Upload documents, explore semantic chunks, and ask questions with 100% grounded answers, page citations, and zero cloud lock-in.
          </p>
        </div>

        <div className="relative flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            onClick={() => navigate('/chat')}
            leftIcon={<MessageSquare className="w-4 h-4 text-[#5A4634] dark:text-[#E5D5BA]" />}
            className="rounded-xl shadow-xs border border-[#CDBB9D] dark:border-[#554638]"
          >
            Start Chat
          </Button>
          <Button
            variant="accent"
            onClick={() => setUploadOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="rounded-xl shadow-xs"
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatMetricCard
              title="Total Documents"
              value={overview?.total_documents ?? documents.length}
              subtitle="Indexed in local store"
              icon={FileText}
              iconColor="text-[#8B6F52] bg-[#E1D2B8] dark:bg-[#3E3228]"
            />
            <StatMetricCard
              title="Indexed Chunks"
              value={overview?.total_chunks ?? 0}
              subtitle="Semantic vectors"
              icon={Layers}
              iconColor="text-[#8B6F52] bg-[#E1D2B8] dark:bg-[#3E3228]"
            />
            <StatMetricCard
              title="Questions Answered"
              value={overview?.total_queries ?? 0}
              subtitle="Grounded Q&A queries"
              icon={MessageSquare}
              iconColor="text-[#657A58] bg-[#657A58]/15 dark:bg-[#657A58]/25"
            />
            <StatMetricCard
              title="Success / Grounding"
              value={`${overview?.success_rate ?? 100}%`}
              subtitle={`Avg latency: ${performance?.avg_total_ms ? (performance.avg_total_ms / 1000).toFixed(1) : 0}s`}
              icon={Zap}
              iconColor="text-[#B38A4A] bg-[#B38A4A]/15 dark:bg-[#B38A4A]/25"
              badge="Accurate"
            />
          </>
        )}
      </div>

      {/* Main Sections: Recent Documents & Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#30261E] dark:text-[#F7F0E3]">
                Recent Documents
              </h2>
              <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA]">
                Quickly access and ask questions about your indexed documents
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/documents')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs text-[#5A4634] dark:text-[#E8DCC8] hover:bg-[#E1D2B8]/40 dark:hover:bg-[#3E3228]"
            >
              View all ({documents.length})
            </Button>
          </div>

          {docsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-44 rounded-xl" />
            </div>
          ) : documents.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22]">
              <FileText className="w-10 h-10 text-[#8B6F52] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#30261E] dark:text-[#F7F0E3]">
                No documents uploaded yet
              </h4>
              <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-1 max-w-sm mx-auto">
                Upload your first PDF, DOCX, TXT, or MD document to start querying it with local Llama 3.2.
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setUploadOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Upload First Document
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.slice(0, 4).map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Conversations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#30261E] dark:text-[#F7F0E3]">
                Recent Chats
              </h2>
              <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA]">Past Q&A threads</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/chat')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs text-[#5A4634] dark:text-[#E8DCC8] hover:bg-[#E1D2B8]/40 dark:hover:bg-[#3E3228]"
            >
              All Chats
            </Button>
          </div>

          <Card className="border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] divide-y divide-[#D4C3A5]/40 dark:divide-[#524436]/40">
            {convsLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5A4634] dark:text-[#DCC9AA]">
                No conversations yet. Ask a question to start.
              </div>
            ) : (
              conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className="p-3.5 hover:bg-[#EDE1CD]/60 dark:hover:bg-[#3D3128]/60 cursor-pointer transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <MessageSquare className="w-4 h-4 text-[#8B6F52] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3] truncate group-hover:text-[#8B6F52]">
                        {conv.title}
                      </p>
                      <p className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA] mt-0.5 font-medium">
                        {conv.messages?.length || 0} messages
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5A4634] dark:text-[#DCC9AA] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      <DocumentUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  );
};
