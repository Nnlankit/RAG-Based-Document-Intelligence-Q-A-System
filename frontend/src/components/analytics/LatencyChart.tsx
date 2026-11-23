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
      index: `Q${idx + 1}`,
      query: q.query.length > 20 ? `${q.query.slice(0, 20)}...` : q.query,
      Retrieval: Math.round(q.retrieval_latency_ms || 0),
      Generation: Math.round(q.generation_latency_ms || 0),
      Total: Math.round(q.total_latency_ms || 0),
    }));

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center text-xs text-[#77738A] dark:text-[#A8A499] border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124]">
        No query latency records available yet.
      </Card>
    );
  }

  return (
    <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card">
      <CardHeader>
        <h4 className="text-xs font-bold text-[#202124] dark:text-white uppercase tracking-wider">
          Query Latency Breakdown (ms)
        </h4>
        <p className="text-xs text-[#77738A] dark:text-[#A8A499] mt-0.5">
          Retrieval (pgvector + BM25 + Rerank) vs Generation (Local Llama 3.2)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E1CC" opacity={0.6} />
              <XAxis dataKey="index" tick={{ fontSize: 11, fill: '#77738A' }} stroke="#E9E1CC" />
              <YAxis tick={{ fontSize: 11, fill: '#77738A' }} stroke="#E9E1CC" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#202124',
                  borderColor: '#303238',
                  borderRadius: '1rem',
                  color: '#FFFDF5',
                  fontSize: '12px',
                  boxShadow: '0 4px 14px rgba(32, 33, 36, 0.25)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
              <Bar dataKey="Retrieval" fill="#4D9B45" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Generation" fill="#303238" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
