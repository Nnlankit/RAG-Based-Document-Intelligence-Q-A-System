export interface SourceAttribution {
  document_id: string;
  filename: string;
  page_number?: number | null;
  chunk_id: string;
  score: number;
  snippet: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
  sources?: SourceAttribution[];
  retrieval_latency_ms?: number;
  generation_latency_ms?: number;
  total_latency_ms?: number;
  abstention?: boolean;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatRequest {
  question: string;
  conversation_id?: string | null;
  document_ids?: string[] | null;
  similarity_threshold?: number;
  top_k?: number;
}

export interface ChatResponse {
  answer: string;
  conversation_id: string;
  sources: SourceAttribution[];
  retrieval_latency_ms: number;
  generation_latency_ms: number;
  total_latency_ms: number;
  abstention: boolean;
}
