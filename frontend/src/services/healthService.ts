import { api } from './api';
import { HealthCheckResponse } from '../types/common';

export const healthService = {
  async checkHealth(): Promise<HealthCheckResponse> {
    const res = await api.get<HealthCheckResponse>('/health');
    return res.data;
  },
};
