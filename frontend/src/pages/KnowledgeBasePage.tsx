import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Layers,
  Sparkles,
  FileText,
  Search,
  CheckCircle2,
  Cpu,
  ArrowRight,
  HardDrive,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { analyticsService } from '../services/analyticsService';
import { healthService } from '../services/healthService';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';

export const KnowledgeBasePage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchDoc, setSearchDoc] = useState('');

  const { data: docData, isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.listDocuments(),
  });

  const { data: statsData, isLoading: statsLoading, refetch, isFetching } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => analyticsService.getStats(),
  });

  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: healthService.checkHealth,
  });

  const documents = docData?.documents || [];
  const overview = statsData?.overview;
  const filteredDocs = documents.filter((d) =>
    d.filename.toLowerCase().includes(searchDoc.toLowerCase())
  );

  const embeddingModel = health?.details?.embedding_model || 'nomic-embed-text';
  const vectorStore = health?.details?.vector_store_type?.toUpperCase() || 'PGVECTOR';
  const totalChunks = overview?.total_chunks || 0;
  const totalDocs = overview?.total_documents || documents.length;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#17152B] dark:text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-[#5920B5]" />
            <span>Knowledge Base & Semantic Vectors</span>
          </h1>
          <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-1 font-medium">
            Explore dense vector embeddings, pgvector semantic collections, and index partitions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Sync Index
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setUploadOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add to Knowledge Base
          </Button>
        </div>
      </div>

      {/* Vector Engine Architecture Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#77738A] dark:text-[#A39EB8] uppercase tracking-wider">
              Vector Engine
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#A78BFA] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#17152B] dark:text-white">{vectorStore}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Neon Cloud PostgreSQL</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#77738A] dark:text-[#A39EB8] uppercase tracking-wider">
              Total Embeddings
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] text-[#8B5CF6] dark:text-[#A78BFA] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#17152B] dark:text-white">{totalChunks}</p>
          <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8]">
            Dense 768-dimensional vectors
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#77738A] dark:text-[#A39EB8] uppercase tracking-wider">
              Embedding Model
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] text-[#5920B5] dark:text-[#A78BFA] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#17152B] dark:text-white font-mono">{embeddingModel}</p>
          <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8]">
            Cosine Similarity Metric
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#77738A] dark:text-[#A39EB8] uppercase tracking-wider">
              Grounded Index
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#17152B] dark:text-white">{totalDocs} Documents</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            100% In-Context Grounding
          </p>
        </div>
      </div>

      {/* Document Index Partition Explorer */}
      <Card className="border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#17152B] dark:text-white">
              Knowledge Partitions by Document
            </h3>
            <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-0.5">
              Inspect semantic chunks, vector volume, and page partitions per document
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#77738A] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search partitions..."
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] text-[#17152B] dark:text-[#F5F3FF] placeholder-[#77738A]/70 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
            />
          </div>
        </CardHeader>

        <CardContent>
          {docsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#77738A]">
              No documents currently in knowledge base.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map((doc) => {
                const chunkPct = totalChunks > 0 ? Math.round((doc.chunk_count / totalChunks) * 100) : 0;
                return (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="p-4 rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] hover:border-[#8B5CF6] hover:bg-[#F3EEFB] dark:hover:bg-[#1E1733] cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#2A2047] text-[#5920B5] dark:text-[#A78BFA] border border-[#E8E1F2] dark:border-[#3E3065] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#17152B] dark:text-white truncate group-hover:text-[#5920B5] transition-colors">
                          {doc.filename}
                        </p>
                        <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8] mt-0.5">
                          ID: <span className="font-mono">{doc.id.slice(0, 12)}...</span> • {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-auto shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-[#5920B5] dark:text-[#A78BFA]">
                          {doc.chunk_count} vectors
                        </p>
                        <p className="text-[10px] text-[#77738A]">
                          {chunkPct}% of total index
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="text-xs text-[#5920B5]"
                      >
                        Inspect Vectors
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  );
};
