import { api, API_BASE_URL } from './api';
import {
  ChatRequest,
  ChatResponse,
  Conversation,
  SourceAttribution,
} from '../types/chat';

export const chatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const res = await api.post<ChatResponse>('/chat', request);
    return res.data;
  },

  async sendMessageStream(
    request: ChatRequest,
    onToken: (token: string) => void,
    onSources: (sources: SourceAttribution[]) => void,
    onAbstention: (text: string) => void,
    onDone: (data: {
      full_answer: string;
      generation_latency_ms: number;
      total_latency_ms: number;
      metadata?: Record<string, any>;
    }) => void,
    onConversation: (id: string) => void,
    onTiming?: (timings: {
      frontend_request_start: number;
      frontend_first_response: number;
      frontend_response_complete: number;
      frontend_ttft_ms: number;
      total_stream_duration_ms: number;
    }) => void
  ): Promise<void> {
    const reqStart = performance.now();
    let firstTokenTime: number | null = null;

    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Streaming failed with HTTP status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'conversation') {
              onConversation(data.conversation_id);
            } else if (data.type === 'token') {
              if (!firstTokenTime) {
                firstTokenTime = performance.now();
              }
              onToken(data.content);
            } else if (data.type === 'sources') {
              onSources(data.sources);
            } else if (data.type === 'abstention') {
              onAbstention(data.content);
            } else if (data.type === 'done') {
              const reqEnd = performance.now();
              onTiming?.({
                frontend_request_start: Math.round(reqStart),
                frontend_first_response: Math.round(firstTokenTime || reqEnd),
                frontend_response_complete: Math.round(reqEnd),
                frontend_ttft_ms: Math.round(firstTokenTime ? firstTokenTime - reqStart : 0),
                total_stream_duration_ms: Math.round(reqEnd - reqStart),
              });
              onDone(data);
            }
          } catch (e) {
            console.error('Failed parsing stream chunk:', e);
          }
        }
      }
    }
  },

  async listConversations(): Promise<Conversation[]> {
    const res = await api.get<Conversation[]>('/conversations');
    return res.data;
  },

  async getConversation(id: string): Promise<Conversation> {
    const res = await api.get<Conversation>(`/conversations/${id}`);
    return res.data;
  },

  async renameConversation(id: string, title: string): Promise<Conversation> {
    const res = await api.patch<Conversation>(`/conversations/${id}`, { title });
    return res.data;
  },

  async deleteConversation(id: string): Promise<{ message: string }> {
    const res = await api.delete<{ message: string }>(`/conversations/${id}`);
    return res.data;
  },
};
