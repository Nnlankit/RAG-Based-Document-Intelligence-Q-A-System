import { api } from './api';
import {
  ChatRequest,
  ChatResponse,
  Conversation,
} from '../types/chat';

export const chatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const res = await api.post<ChatResponse>('/chat', request);
    return res.data;
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
