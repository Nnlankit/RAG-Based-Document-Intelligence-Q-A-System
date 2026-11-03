import React from 'react';
import { Clock, Layers, Sparkles } from 'lucide-react';
import { RecentQueryItem } from '../../types/analytics';
import { Card, CardHeader, CardContent } from '../common/Card';

interface RecentQueriesTableProps {
  queries: RecentQueryItem[];
}

export const RecentQueriesTable: React.FC<RecentQueriesTableProps> = ({ queries }) => {
  return (
    <Card className="border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] overflow-hidden shadow-card">
      <CardHeader>
        <h4 className="text-xs font-bold text-[#17152B] dark:text-white uppercase tracking-wider">
          Query Audit & Observability Telemetry
        </h4>
        <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-0.5">
          Detailed metrics for natural-language questions processed by the RAG engine
        </p>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8FD] dark:bg-[#150F24] text-[#77738A] dark:text-[#A39EB8] font-bold border-b border-[#E8E1F2] dark:border-[#352B52] uppercase tracking-wider">
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
          <tbody className="divide-y divide-[#E8E1F2] dark:divide-[#352B52]">
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
                  <tr key={q.id} className="hover:bg-[#FAF8FD] dark:hover:bg-[#1A132C] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#17152B] dark:text-[#F5F3FF] max-w-xs truncate" title={q.query}>
                      {q.query}
                    </td>
                    <td className="py-3.5 px-4 text-[#77738A] dark:text-[#A39EB8] max-w-xs truncate" title={q.rewritten_query || ''}>
                      {q.rewritten_query ? (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-[#5920B5] dark:text-[#A78BFA]">
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span className="truncate">{q.rewritten_query}</span>
                        </span>
                      ) : (
                        <span className="text-[#77738A] italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#5920B5] dark:text-[#A78BFA]">
                      {q.chunks_retrieved}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#77738A]">
                      {q.retrieval_latency_ms.toFixed(1)} ms
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#77738A]">
                      {(q.generation_latency_ms / 1000).toFixed(2)} s
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#16A34A] dark:text-[#4ADE80]">
                      {(q.total_latency_ms / 1000).toFixed(2)} s
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
