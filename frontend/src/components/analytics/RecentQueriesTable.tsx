import React from 'react';
import { Clock, Layers, Sparkles } from 'lucide-react';
import { RecentQueryItem } from '../../types/analytics';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';

interface RecentQueriesTableProps {
  queries: RecentQueryItem[];
}

export const RecentQueriesTable: React.FC<RecentQueriesTableProps> = ({ queries }) => {
  return (
    <Card className="border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] overflow-hidden shadow-card">
      <CardHeader>
        <h4 className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3] uppercase tracking-wider">
          Query Audit & Observability Log
        </h4>
        <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5">
          Detailed metrics for natural-language questions processed by the RAG engine
        </p>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#EEE3D0] dark:bg-[#2A221C] text-[#5A4634] dark:text-[#DCC9AA] font-semibold border-b border-[#D4C3A5] dark:border-[#524436] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">User Query</th>
              <th className="py-3 px-4">Rewritten Query</th>
              <th className="py-3 px-4">Chunks</th>
              <th className="py-3 px-4">Retrieval</th>
              <th className="py-3 px-4">Generation</th>
              <th className="py-3 px-4">Total Time</th>
              <th className="py-3 px-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4C3A5]/40 dark:divide-[#524436]/40">
            {queries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#5A4634] dark:text-[#DCC9AA]">
                  No retrieval queries recorded yet.
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
                  <tr key={q.id} className="hover:bg-[#EDE1CD]/60 dark:hover:bg-[#3D3128]/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#30261E] dark:text-[#F7F0E3] max-w-xs truncate" title={q.query}>
                      {q.query}
                    </td>
                    <td className="py-3 px-4 text-[#5A4634] dark:text-[#DCC9AA] max-w-xs truncate" title={q.rewritten_query || ''}>
                      {q.rewritten_query ? (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-[#8B6F52] dark:text-[#D4A359]">
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span className="truncate">{q.rewritten_query}</span>
                        </span>
                      ) : (
                        <span className="text-[#6B5C4D] dark:text-[#B9A995] italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[#5A4634] dark:text-[#D8C6A7]">
                        {q.chunks_retrieved}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5A4634] dark:text-[#DCC9AA]">
                      {q.retrieval_latency_ms.toFixed(0)} ms
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5A4634] dark:text-[#DCC9AA]">
                      {(q.generation_latency_ms / 1000).toFixed(2)} s
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#30261E] dark:text-[#F7F0E3]">
                      {(q.total_latency_ms / 1000).toFixed(2)} s
                    </td>
                    <td className="py-3 px-4 text-[#5A4634] dark:text-[#DCC9AA] text-[11px]">
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
