import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://orbitstaffing.io/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setAuthToken = async (token: string | null) => {
  authToken = token;
  if (token) {
    await SecureStore.setItemAsync('authToken', token);
  } else {
    await SecureStore.deleteItemAsync('authToken');
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (!authToken) {
    authToken = await SecureStore.getItemAsync('authToken');
  }
  return authToken;
};

export const clearAuthToken = async () => {
  authToken = null;
  await SecureStore.deleteItemAsync('authToken');
};

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuthToken();
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (phone: string, pin: string) =>
    apiClient.post('/auth/login', { phone, pin }),
  loginEmail: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data: { firstName: string; lastName: string; email: string; phone: string; password: string }) =>
    apiClient.post('/auth/register', data),
  verifyBiometric: (workerId: string) =>
    apiClient.post('/auth/biometric', { workerId }),
  getProfile: () => apiClient.get('/auth/me'),
};

export const gps = {
  clockIn: (workerId: string, latitude: number, longitude: number, accuracy: number) =>
    apiClient.post('/clock-in/submit', { workerId, latitude, longitude, accuracy }),
  clockOut: (workerId: string) =>
    apiClient.post('/clock-out/submit', { workerId }),
  getStatus: (workerId: string) =>
    apiClient.get(`/clock-status/${workerId}`),
};

export const assignments = {
  getPending: (workerId: string) =>
    apiClient.get(`/assignments/pending/${workerId}`),
  getActive: (workerId: string) =>
    apiClient.get(`/assignments/active/${workerId}`),
  getHistory: (workerId: string) =>
    apiClient.get(`/assignments/history/${workerId}`),
  accept: (acceptanceId: string) =>
    apiClient.post(`/assignments/accept/${acceptanceId}`),
  reject: (acceptanceId: string, reason: string) =>
    apiClient.post(`/assignments/reject/${acceptanceId}`, { reason }),
};

export const worker = {
  getProfile: (workerId: string) =>
    apiClient.get(`/workers/${workerId}`),
  updateProfile: (workerId: string, data: any) =>
    apiClient.patch(`/workers/${workerId}`, data),
  getBonuses: (workerId: string, weekStart: string) =>
    apiClient.get(`/bonuses/worker/${workerId}/week/${weekStart}`),
  getAvailability: (workerId: string, date: string) =>
    apiClient.get(`/availability/worker/${workerId}/date/${date}`),
  setAvailability: (workerId: string, date: string, available: boolean) =>
    apiClient.post(`/availability/worker/${workerId}`, { date, available }),
  getTimesheets: (workerId: string) =>
    apiClient.get(`/timesheets/worker/${workerId}`),
  getPayouts: (workerId: string) =>
    apiClient.get(`/payouts/worker/${workerId}`),
};

export const jobs = {
  search: (params: { skills?: string[]; location?: string; radius?: number }) =>
    apiClient.get('/jobs/search', { params }),
  getDetails: (jobId: string) =>
    apiClient.get(`/jobs/${jobId}`),
  apply: (jobId: string, workerId: string) =>
    apiClient.post(`/jobs/${jobId}/apply`, { workerId }),
};

export const notifications = {
  registerPushToken: (token: string, workerId: string) =>
    apiClient.post('/notifications/register', { pushToken: token, workerId }),
  getNotifications: (workerId: string) =>
    apiClient.get(`/notifications/worker/${workerId}`),
  markRead: (notificationId: string) =>
    apiClient.patch(`/notifications/${notificationId}/read`),
};
