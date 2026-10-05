import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Clock,
  Zap,
  Layers,
  FileText,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { StatMetricCard } from '../components/analytics/StatMetricCard';
import { LatencyChart } from '../components/analytics/LatencyChart';
import { DocDistributionChart } from '../components/analytics/DocDistributionChart';
import { RecentQueriesTable } from '../components/analytics/RecentQueriesTable';
import { Skeleton } from '../components/common/Skeleton';

export const AnalyticsPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => analyticsService.getStats(),
  });

  const overview = stats?.overview;
  const performance = stats?.performance;
  const recentQueries = stats?.recent_queries || [];
  const docTypes = stats?.document_types || {};

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#30261E] dark:text-[#F7F0E3]">
          Analytics & System Observability
        </h1>
        <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5 font-medium">
          Real-time telemetry across vector retrieval, LLM inference latency, and query grounding
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatMetricCard
              title="Total Queries"
              value={overview?.total_queries ?? 0}
              subtitle="Audited in retrieval log"
              icon={Activity}
              iconColor="text-[#8B6F52] bg-[#E1D2B8] dark:bg-[#3E3228]"
            />
            <StatMetricCard
              title="Avg Retrieval Time"
              value={`${performance?.avg_retrieval_ms ?? 0} ms`}
              subtitle="Vector + BM25 + Rerank"
              icon={Zap}
              iconColor="text-[#8B6F52] bg-[#E1D2B8] dark:bg-[#3E3228]"
            />
            <StatMetricCard
              title="Avg Generation Time"
              value={`${performance?.avg_generation_ms ? (performance.avg_generation_ms / 1000).toFixed(1) : 0} s`}
              subtitle="Local Llama 3.2 via Ollama"
              icon={Clock}
              iconColor="text-[#657A58] bg-[#657A58]/15 dark:bg-[#657A58]/25"
            />
            <StatMetricCard
              title="Grounding Success"
              value={`${overview?.success_rate ?? 100}%`}
              subtitle="Queries above confidence thresh"
              icon={CheckCircle2}
              iconColor="text-[#B38A4A] bg-[#B38A4A]/15 dark:bg-[#B38A4A]/25"
              badge="Grounded"
            />
          </>
        )}
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <LatencyChart queries={recentQueries} />
        </div>
        <div className="lg:col-span-4">
          <DocDistributionChart distribution={docTypes} />
        </div>
      </div>

      {/* Query Audit Table */}
      <div>
        <RecentQueriesTable queries={recentQueries} />
      </div>
    </div>
  );
};
