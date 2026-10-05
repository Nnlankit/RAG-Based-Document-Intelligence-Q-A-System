import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { RecentQueryItem } from '../../types/analytics';
import { Card, CardHeader, CardContent } from '../common/Card';

interface LatencyChartProps {
  queries: RecentQueryItem[];
}

export const LatencyChart: React.FC<LatencyChartProps> = ({ queries }) => {
  const data = [...queries]
    .reverse()
    .slice(-8)
    .map((q, idx) => ({
      index: `#${idx + 1}`,
      query: q.query.length > 20 ? `${q.query.slice(0, 20)}...` : q.query,
      Retrieval: Math.round(q.retrieval_latency_ms),
      Generation: Math.round(q.generation_latency_ms),
      Total: Math.round(q.total_latency_ms),
    }));

  if (data.length === 0) {
    return (
      <Card className="p-6 text-center text-xs text-[#5A4634] dark:text-[#DCC9AA]">
        No query latency records available yet.
      </Card>
    );
  }

  return (
    <Card className="border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22]">
      <CardHeader>
        <h4 className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3] uppercase tracking-wider">
          Query Latency Breakdown (ms)
        </h4>
        <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5">
          Retrieval (Dense + BM25 + Rerank) vs Generation (Llama 3.2)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D4C3A5" opacity={0.35} />
              <XAxis dataKey="index" tick={{ fontSize: 11, fill: '#5A4634' }} stroke="#D4C3A5" />
              <YAxis tick={{ fontSize: 11, fill: '#5A4634' }} stroke="#D4C3A5" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#30261E',
                  borderColor: '#5A4634',
                  borderRadius: '0.75rem',
                  color: '#F7F0E3',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="Retrieval" fill="#8B6F52" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Generation" fill="#657A58" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
