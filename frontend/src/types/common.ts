export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'healthy' | 'unhealthy';
  vector_store: 'healthy' | 'unhealthy';
  ollama: 'healthy' | 'unhealthy';
  models: {
    'llama3.2': boolean;
    'nomic-embed-text': boolean;
    [key: string]: boolean;
  };
  details: {
    vector_store_type: string;
    llm_model: string;
    embedding_model: string;
    ollama_base_url: string;
    chunk_size: number;
    chunk_overlap: number;
    [key: string]: any;
  };
}

export interface ApiErrorDetail {
  detail: string | { message?: string; msg?: string; [key: string]: any };
}
