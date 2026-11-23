import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Cpu,
  Database,
  Layers,
  Activity,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { healthService } from '../../services/healthService';
import { analyticsService } from '../../services/analyticsService';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';

export const SystemStatusCard: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();
  const [selectedService, setSelectedService] = useState<'llm' | 'db' | 'vector' | null>(null);

  const { data: health, isLoading: healthLoading, refetch, isFetching } = useQuery({
    queryKey: ['system-health'],
    queryFn: healthService.checkHealth,
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => analyticsService.getStats(),
  });

  const handleRefresh = async () => {
    await refetch();
    success('Health Status Refreshed', 'Telemetry and connection states updated.');
  };

  const isDbConnected = health?.database === 'healthy';
  const isVectorConnected = health?.vector_store === 'healthy';
  const isLlmOnline = health?.ollama === 'healthy';
  const llmModelName = health?.details?.llm_model || 'Llama 3.2 (3B)';
  const vectorStoreType = health?.details?.vector_store_type?.toUpperCase() || 'PGVECTOR';
  const totalChunks = stats?.overview?.total_chunks ?? 0;

  return (
    <>
      <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card h-full min-h-[300px] flex flex-col justify-between">
        <CardHeader className="h-14 flex items-center justify-between px-4 py-2.5 border-b border-[#E9E1CC] dark:border-[#303238]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#FFE89A] flex items-center justify-center text-[#202124] shadow-xs shrink-0">
              <Activity className="w-3.5 h-3.5 text-[#202124]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#202124] dark:text-white truncate">
                System Health
              </h3>
              <p className="text-[11px] text-[#77746B] dark:text-[#A99F87] truncate">
                Click any service for diagnostics
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-1 rounded-md text-[#77746B] hover:text-[#202124] hover:bg-[#FFE89A]/30 dark:hover:bg-[#303238] transition-all disabled:opacity-50 shrink-0"
            title="Refresh health checks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#202124]' : ''}`} />
          </button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between p-3 space-y-2">
          <div className="flex flex-col gap-2 h-full justify-between">
            {/* 1. LLM Model */}
            <button
              onClick={() => setSelectedService('llm')}
              className="p-2 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] hover:border-[#FFE89A] dark:hover:border-[#FFE89A] hover:shadow-xs flex items-center justify-between transition-all text-left cursor-pointer active:scale-98 group w-full"
              title="Click for LLM Engine details"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#FFE89A]/30 dark:bg-[#303238] flex items-center justify-center text-[#202124] dark:text-[#FFE89A] shrink-0 group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4 text-[#202124] dark:text-[#FFE89A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-[#77746B]">
                    LLM Engine
                  </p>
                  <p className="text-xs font-bold text-[#202124] dark:text-white truncate group-hover:text-[#4D9B45] dark:group-hover:text-[#FFE89A] transition-colors">
                    {llmModelName}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                  isLlmOnline
                    ? 'bg-[#E5F4DC] text-[#245B32] border-[#C2E599] dark:bg-[#1B4526] dark:text-[#DDF2C1] dark:border-[#3D8036]'
                    : 'bg-[#FCE8E8] text-[#A63838] border-[#F8C8C8] dark:bg-[#5C1D1D] dark:text-[#F87171] dark:border-[#8E2828]'
                }`}
              >
                {isLlmOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4D9B45] animate-pulse" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C94B4B]" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </button>

            {/* 2. Relational Database */}
            <button
              onClick={() => setSelectedService('db')}
              className="p-2 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] hover:border-[#FFE89A] dark:hover:border-[#FFE89A] hover:shadow-xs flex items-center justify-between transition-all text-left cursor-pointer active:scale-98 group w-full"
              title="Click for Relational DB details"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#FFE89A]/30 dark:bg-[#303238] flex items-center justify-center text-[#202124] dark:text-[#FFE89A] shrink-0 group-hover:scale-105 transition-transform">
                  <Database className="w-4 h-4 text-[#202124] dark:text-[#FFE89A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-[#77746B]">
                    Relational DB
                  </p>
                  <p className="text-xs font-bold text-[#202124] dark:text-white truncate group-hover:text-[#4D9B45] dark:group-hover:text-[#FFE89A] transition-colors">
                    Neon PostgreSQL
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                  isDbConnected
                    ? 'bg-[#E5F4DC] text-[#245B32] border-[#C2E599] dark:bg-[#1B4526] dark:text-[#DDF2C1] dark:border-[#3D8036]'
                    : 'bg-[#FCE8E8] text-[#A63838] border-[#F8C8C8] dark:bg-[#5C1D1D] dark:text-[#F87171] dark:border-[#8E2828]'
                }`}
              >
                {isDbConnected ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4D9B45] animate-pulse" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C94B4B]" />
                    <span>Disconnected</span>
                  </>
                )}
              </div>
            </button>

            {/* 3. Vector Database */}
            <button
              onClick={() => setSelectedService('vector')}
              className="p-2 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] hover:border-[#FFE89A] dark:hover:border-[#FFE89A] hover:shadow-xs flex items-center justify-between transition-all text-left cursor-pointer active:scale-98 group w-full"
              title="Click for Vector Store details"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#FFE89A]/30 dark:bg-[#303238] flex items-center justify-center text-[#202124] dark:text-[#FFE89A] shrink-0 group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4 text-[#202124] dark:text-[#FFE89A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-[#77746B]">
                    Vector Store
                  </p>
                  <p className="text-xs font-bold text-[#202124] dark:text-white truncate group-hover:text-[#4D9B45] dark:group-hover:text-[#FFE89A] transition-colors">
                    {vectorStoreType} ({totalChunks} chunks)
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                  isVectorConnected
                    ? 'bg-[#E5F4DC] text-[#245B32] border-[#C2E599] dark:bg-[#1B4526] dark:text-[#DDF2C1] dark:border-[#3D8036]'
                    : 'bg-[#FCE8E8] text-[#A63838] border-[#F8C8C8] dark:bg-[#5C1D1D] dark:text-[#F87171] dark:border-[#8E2828]'
                }`}
              >
                {isVectorConnected ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4D9B45] animate-pulse" />
                    <span>Indexed</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C94B4B]" />
                    <span>Unavailable</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Service Details Modal */}
      <Modal
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
        title={
          selectedService === 'llm'
            ? 'LLM Engine & Inference Service'
            : selectedService === 'db'
            ? 'Relational Database (Neon PostgreSQL)'
            : 'Vector Store (Neon pgvector)'
        }
        description="Live diagnostics, configuration parameters, and connectivity telemetry."
        size="md"
      >
        <div className="space-y-4">
          {selectedService === 'llm' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#202124] dark:text-white">Active LLM Model</p>
                  <p className="text-[11px] text-[#77746B]">{health?.details?.llm_model || 'llama3.2:latest'}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F4DC] text-[#245B32] border border-[#C2E599]">
                  {health?.ollama === 'healthy' ? 'Healthy & Loaded' : 'Unavailable'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">Provider</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5">Local Ollama</p>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">Context Window</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5">1,536 Tokens (Optimized)</p>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">Embedding Model</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5 truncate">
                    {health?.details?.embedding_model || 'nomic-embed-text'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">Ollama URL</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5 font-mono text-[11px] truncate">
                    {health?.details?.ollama_base_url || 'http://localhost:11434'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedService(null);
                    navigate('/settings');
                  }}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Configure in Settings
                </Button>
                <Button variant="primary" size="sm" onClick={() => setSelectedService(null)}>
                  Done
                </Button>
              </div>
            </div>
          )}

          {selectedService === 'db' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#202124] dark:text-white">PostgreSQL Connection</p>
                  <p className="text-[11px] text-[#77746B]">Neon Cloud Serverless Lakebase</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F4DC] text-[#245B32] border border-[#C2E599]">
                  {health?.database === 'healthy' ? 'Connected & Verified' : 'Disconnected'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">Total Documents</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5">
                    {stats?.overview?.total_documents ?? 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">Total Queries</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5">
                    {stats?.overview?.total_queries ?? 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">ACID Isolation</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5">Enabled (Read Committed)</p>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">Storage Mode</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5">Cloud PostgreSQL</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedService(null);
                    navigate('/documents');
                  }}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View Documents
                </Button>
                <Button variant="primary" size="sm" onClick={() => setSelectedService(null)}>
                  Done
                </Button>
              </div>
            </div>
          )}

          {selectedService === 'vector' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#FFFDF5] dark:bg-[#17181A] border border-[#E9E1CC] dark:border-[#303238] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#202124] dark:text-white">pgvector Semantic Index</p>
                  <p className="text-[11px] text-[#77746B]">{totalChunks} chunks indexed into vector collection</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F4DC] text-[#245B32] border border-[#C2E599]">
                  {health?.vector_store === 'healthy' ? 'Operational' : 'Unavailable'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">HNSW Indexing</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5">
                    m=16, ef_search=64
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">Vector Dimension</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5">
                    768 (nomic-embed-text)
                  </p>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">Similarity Metric</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5">Cosine Distance (&lt;=&gt;)</p>
                </div>
                <div className="p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#17181A]">
                  <p className="text-[10px] font-bold text-[#77746B] uppercase">Store Type</p>
                  <p className="font-semibold text-[#202124] dark:text-white mt-0.5">{vectorStoreType}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedService(null);
                    navigate('/knowledge-base');
                  }}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Explore Knowledge Base
                </Button>
                <Button variant="primary" size="sm" onClick={() => setSelectedService(null)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
