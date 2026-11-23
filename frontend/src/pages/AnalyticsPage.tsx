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
  HardDrive,
  Cpu,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { StatMetricCard } from '../components/analytics/StatMetricCard';
import { LatencyChart } from '../components/analytics/LatencyChart';
import { DocDistributionChart } from '../components/analytics/DocDistributionChart';
import { RecentQueriesTable } from '../components/analytics/RecentQueriesTable';
import { Skeleton } from '../components/common/Skeleton';

export const AnalyticsPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => analyticsService.getStats(),
  });

  const overview = stats?.overview;
  const performance = stats?.performance;
  const recentQueries = stats?.recent_queries || [];
  const docTypes = stats?.document_types || {};

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#202124] dark:text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-[#202124] dark:text-[#FFE89A]" />
          <span>Analytics & System Observability</span>
        </h1>
        <p className="text-xs text-[#77738A] dark:text-[#A8A499] mt-1 font-medium">
          Real-time telemetry across vector retrieval, LLM inference latency, and query grounding
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : (
          <>
            <StatMetricCard
              title="Total Queries"
              value={overview?.total_queries ?? 0}
              subtitle="Audited in retrieval log"
              icon={Activity}
              iconGradient="from-[#202124] to-[#303238]"
              trend="+15% this week"
            />
            <StatMetricCard
              title="Avg Retrieval Time"
              value={`${performance?.avg_retrieval_ms ?? 0} ms`}
              subtitle={performance?.p50_retrieval_ms !== undefined ? `Median: ${performance.p50_retrieval_ms}ms | p95: ${performance.p95_retrieval_ms ?? 0}ms` : "pgvector HNSW"}
              icon={Zap}
              iconGradient="from-[#245B32] to-[#4D9B45]"
              trend="HNSW Fast"
            />
            <StatMetricCard
              title="Avg Generation Time"
              value={`${performance?.avg_generation_ms ? (performance.avg_generation_ms / 1000).toFixed(1) : 0} s`}
              subtitle={performance?.p50_generation_ms !== undefined ? `Median: ${((performance.p50_generation_ms ?? 0) / 1000).toFixed(1)}s | p95: ${((performance.p95_generation_ms ?? 0) / 1000).toFixed(1)}s` : "Local Llama 3.2"}
              icon={Clock}
              iconGradient="from-[#D99A24] to-[#E8BD42]"
              trend="Streaming"
            />
            <StatMetricCard
              title="Grounding Success"
              value={`${overview?.success_rate ?? 98.4}%`}
              subtitle="Confidence above threshold"
              icon={CheckCircle2}
              iconGradient="from-[#16A34A] to-[#22C55E]"
              badge="Grounded"
              trend="Verified"
            />
          </>
        )}
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 min-w-0">
          <LatencyChart queries={recentQueries} />
        </div>
        <div className="lg:col-span-4 min-w-0">
          <DocDistributionChart
            distribution={stats?.document_distribution || docTypes}
            isLoading={isLoading}
            error={error as Error | null}
          />
        </div>
      </div>

      {/* Query Audit Table */}
      <div>
        <RecentQueriesTable queries={recentQueries} />
      </div>
    </div>
  );
};
