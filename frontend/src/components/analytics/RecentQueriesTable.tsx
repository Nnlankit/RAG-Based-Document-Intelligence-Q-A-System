import React from 'react';
import { Clock, Layers, Sparkles } from 'lucide-react';
import { RecentQueryItem } from '../../types/analytics';
import { Card, CardHeader, CardContent } from '../common/Card';

interface RecentQueriesTableProps {
  queries: RecentQueryItem[];
}

export const RecentQueriesTable: React.FC<RecentQueriesTableProps> = ({ queries }) => {
  return (
    <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] overflow-hidden shadow-card">
      <CardHeader>
        <h4 className="text-xs font-bold text-[#202124] dark:text-white uppercase tracking-wider">
          Query Audit & Observability Telemetry
        </h4>
        <p className="text-xs text-[#77738A] dark:text-[#A8A499] mt-0.5">
          Detailed metrics for natural-language questions processed by the RAG engine
        </p>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FFFDF5] dark:bg-[#1A1A1C] text-[#77738A] dark:text-[#A8A499] font-bold border-b border-[#E9E1CC] dark:border-[#303238] uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">User Query</th>
              <th className="py-3.5 px-4">Rewritten Query</th>
              <th className="py-3.5 px-4">Chunks</th>
              <th className="py-3.5 px-4">Retrieval</th>
              <th className="py-3.5 px-4">Generation</th>
              <th className="py-3.5 px-4">Total Time</th>
              <th className="py-3.5 px-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E1CC] dark:divide-[#303238]">
            {queries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[#77738A]">
                  No retrieval queries recorded yet. Ask questions in AI Chat to populate telemetry.
                </td>
              </tr>
            ) : (
              queries.map((q) => {
                const dateFormatted = q.created_at
                  ? new Date(q.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-';

                return (
                  <tr key={q.id} className="hover:bg-[#FFF9E8] dark:hover:bg-[#2A2B2E] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#202124] dark:text-[#FFFDF5] max-w-xs truncate" title={q.query}>
                      {q.query}
                    </td>
                    <td className="py-3.5 px-4 text-[#77738A] dark:text-[#A8A499] max-w-xs truncate" title={q.rewritten_query || ''}>
                      {q.rewritten_query ? (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-[#245B32] dark:text-[#DDF2C1]">
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span className="truncate">{q.rewritten_query}</span>
                        </span>
                      ) : (
                        <span className="text-[#77738A] italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#202124] dark:text-[#FFE89A]">
                      {q.chunks_retrieved}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#77738A]">
                      {(q.retrieval_latency_ms ?? 0).toFixed(1)} ms
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#77738A]">
                      {((q.generation_latency_ms ?? 0) / 1000).toFixed(2)} s
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#4D9B45]">
                      {((q.total_latency_ms ?? 0) / 1000).toFixed(2)} s
                    </td>
                    <td className="py-3.5 px-4 text-[#77738A]">
                      {dateFormatted}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
