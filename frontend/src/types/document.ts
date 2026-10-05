export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'deleted';

export interface DocumentItem {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  checksum: string;
  storage_path: string;
  status: DocumentStatus;
  error_message?: string | null;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  documents: DocumentItem[];
  total: number;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  status: DocumentStatus;
  message: string;
  chunk_count: number;
}

export interface DocumentChunkItem {
  id: string;
  chunk_index: number;
  page_number: number | null;
  content: string;
  metadata: {
    document_id?: string;
    filename?: string;
    page_number?: number;
    source_type?: string;
    chunk_index?: number;
    user_id?: string;
    total_pages?: number;
    chunk_id?: string;
    [key: string]: any;
  };
}

export interface DocumentChunksResponse {
  document_id: string;
  filename: string;
  total_chunks: number;
  chunks: DocumentChunkItem[];
}

export interface DocumentSummaryResponse {
  document_id: string;
  summary_type: 'short' | 'detailed' | 'key_points';
  summary: string;
  cached: boolean;
}

export interface ExtractedInfoResponse {
  document_id: string;
  author: string | null;
  organization: string | null;
  document_date: string | null;
  technologies: string[];
  key_findings: string[];
  metadata: Record<string, any>;
}

export interface GeneratedQuestionsResponse {
  document_id: string;
  num_questions: number;
  questions: string[];
}

export interface DocumentCompareResponse {
  document_id_a: string;
  document_id_b: string;
  comparison: string;
  common_themes: string[];
  key_differences: string[];
}
