import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useQuery, useMutation } from 'react-query';
import Constants from 'expo-constants';

const apiUrl = process.env.NODE_ENV === 'development' 
  ? Constants.expoConfig?.extra?.sandboxApiUrl 
  : Constants.expoConfig?.extra?.apiUrl;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Interceptor to attach auth token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const response = await api.post('/auth/refresh', { refreshToken });
        const { token: newToken } = response.data;
        await SecureStore.setItemAsync('authToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        // Redirect to login
        await logout();
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'worker' | 'admin';
  };
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post('/auth/login', credentials);
  const { token, refreshToken } = response.data;
  
  // Store tokens securely
  await SecureStore.setItemAsync('authToken', token);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
  
  return response.data;
}

export async function signup(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<LoginResponse> {
  const response = await api.post('/auth/signup', data);
  const { token, refreshToken } = response.data;
  
  await SecureStore.setItemAsync('authToken', token);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
  
  return response.data;
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync('authToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await api.post('/auth/logout').catch(() => {});
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export function useAuth() {
  const loginMutation = useMutation((credentials: LoginRequest) => login(credentials));
  const signupMutation = useMutation((data: Parameters<typeof signup>[0]) => signup(data));
  const logoutMutation = useMutation(() => logout());
  const userQuery = useQuery('user', getCurrentUser, { retry: false });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
  };
}

export default api;
