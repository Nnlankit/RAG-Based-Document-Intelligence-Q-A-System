import { api } from './api';
import { AnalyticsStatsResponse } from '../types/analytics';

export const analyticsService = {
  async getStats(): Promise<AnalyticsStatsResponse> {
    const res = await api.get<AnalyticsStatsResponse>('/analytics/stats');
    return res.data;
  },
};
