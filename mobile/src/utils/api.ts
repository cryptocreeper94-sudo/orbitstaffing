import axios from 'axios';
import { useAuthStore } from '../store';

const API_BASE_URL = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (phone: string, pin: string) =>
    apiClient.post('/auth/login', { phone, pin }),
  verifyBiometric: (workerId: string) =>
    apiClient.post('/auth/biometric', { workerId }),
};

export const gps = {
  clockIn: (workerId: string, latitude: number, longitude: number, accuracy: number) =>
    apiClient.post('/clock-in/submit', { workerId, latitude, longitude, accuracy }),
  clockOut: (workerId: string) =>
    apiClient.post('/clock-out/submit', { workerId }),
};

export const assignments = {
  getPending: (workerId: string) =>
    apiClient.get(`/assignments/pending/${workerId}`),
  accept: (acceptanceId: string) =>
    apiClient.post(`/assignments/accept/${acceptanceId}`),
  reject: (acceptanceId: string, reason: string) =>
    apiClient.post(`/assignments/reject/${acceptanceId}`, { reason }),
};

export const worker = {
  getProfile: (workerId: string) =>
    apiClient.get(`/workers/${workerId}`),
  getBonuses: (workerId: string, weekStart: string) =>
    apiClient.get(`/bonuses/worker/${workerId}/week/${weekStart}`),
  getAvailability: (workerId: string, date: string) =>
    apiClient.get(`/availability/worker/${workerId}/date/${date}`),
};
