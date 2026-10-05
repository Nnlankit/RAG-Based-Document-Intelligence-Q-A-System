import { api, API_BASE_URL } from './api';
import {
  DocumentItem,
  DocumentListResponse,
  DocumentUploadResponse,
  DocumentChunksResponse,
  DocumentSummaryResponse,
  ExtractedInfoResponse,
  GeneratedQuestionsResponse,
  DocumentCompareResponse,
} from '../types/document';

export const documentService = {
  async listDocuments(skip = 0, limit = 100): Promise<DocumentListResponse> {
    const res = await api.get<DocumentListResponse>('/documents', {
      params: { skip, limit },
    });
    return res.data;
  },

  async getDocument(id: string): Promise<DocumentItem> {
    const res = await api.get<DocumentItem>(`/documents/${id}`);
    return res.data;
  },

  async uploadDocument(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<DocumentUploadResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data;
  },

  async deleteDocument(id: string): Promise<{ message: string }> {
    const res = await api.delete<{ message: string }>(`/documents/${id}`);
    return res.data;
  },

  async getDocumentChunks(id: string): Promise<DocumentChunksResponse> {
    const res = await api.get<DocumentChunksResponse>(`/documents/${id}/chunks`);
    return res.data;
  },

  getDocumentFileUrl(id: string): string {
    return `${API_BASE_URL}/documents/${id}/file`;
  },

  getDocumentDownloadUrl(id: string): string {
    return `${API_BASE_URL}/documents/${id}/download`;
  },

  async getDocumentText(id: string): Promise<string> {
    const res = await api.get<string>(`/documents/${id}/file`, {
      responseType: 'text',
      transformResponse: [(data) => data],
    });
    return typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  },

  downloadDocument(id: string, filename?: string): void {
    const downloadUrl = this.getDocumentDownloadUrl(id);
    const link = document.createElement('a');
    link.href = downloadUrl;
    if (filename) {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async summarize(
    id: string,
    summaryType: 'short' | 'detailed' | 'key_points' = 'short'
  ): Promise<DocumentSummaryResponse> {
    const res = await api.post<DocumentSummaryResponse>(
      `/documents/${id}/summarize`,
      {},
      { params: { summary_type: summaryType } }
    );
    return res.data;
  },

  async extractInfo(id: string): Promise<ExtractedInfoResponse> {
    const res = await api.post<ExtractedInfoResponse>(`/documents/${id}/extract-info`);
    return res.data;
  },

  async generateQuestions(id: string, numQuestions = 10): Promise<GeneratedQuestionsResponse> {
    const res = await api.post<GeneratedQuestionsResponse>(
      `/documents/${id}/generate-questions`,
      {},
      { params: { num_questions: numQuestions } }
    );
    return res.data;
  },

  async compareDocuments(docAId: string, docBId: string): Promise<DocumentCompareResponse> {
    const res = await api.post<DocumentCompareResponse>('/documents/compare', {
      document_id_a: docAId,
      document_id_b: docBId,
    });
    return res.data;
  },
};
