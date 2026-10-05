import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes for local LLM processing
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        message = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail)) {
        message = error.response.data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      } else {
        message = JSON.stringify(error.response.data.detail);
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);
