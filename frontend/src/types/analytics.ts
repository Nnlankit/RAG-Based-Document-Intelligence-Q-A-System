export interface AnalyticsOverview {
  total_documents: number;
  total_chunks: number;
  total_conversations: number;
  total_messages: number;
  total_queries: number;
  total_storage_bytes: number;
  success_rate: number;
}

export interface AnalyticsPerformance {
  avg_retrieval_ms: number;
  avg_generation_ms: number;
  avg_total_ms: number;
}

export interface RecentQueryItem {
  id: string;
  query: string;
  rewritten_query?: string | null;
  chunks_retrieved: number;
  retrieval_latency_ms: number;
  generation_latency_ms: number;
  total_latency_ms: number;
  created_at: string;
}

export interface TopDocumentItem {
  id: string;
  filename: string;
  file_size: number;
  chunk_count: number;
  status: string;
  created_at: string;
}

export interface AnalyticsStatsResponse {
  overview: AnalyticsOverview;
  performance: AnalyticsPerformance;
  document_types: Record<string, number>;
  recent_queries: RecentQueryItem[];
  top_documents: TopDocumentItem[];
}
