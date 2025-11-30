import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'worker' | 'owner' | 'admin';
}

interface AuthStore {
  token: string | null;
  user: User | null;
  workerId: string | null;
  companyName: string | null;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  workerId: null,
  companyName: null,
  isLoading: true,
  
  setAuth: (token, user) => {
    SecureStore.setItemAsync('authToken', token);
    SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ 
      token, 
      user, 
      workerId: user.id,
      companyName: 'ORBIT Staffing',
      isLoading: false 
    });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('user');
    set({ token: null, user: null, workerId: null, companyName: null });
  },
  
  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userStr = await SecureStore.getItemAsync('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ 
          token, 
          user, 
          workerId: user.id,
          companyName: 'ORBIT Staffing',
          isLoading: false 
        });
        return true;
      }
    } catch (e) {
      console.error('Error restoring session:', e);
    }
    set({ isLoading: false });
    return false;
  },
}));

interface GPSState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isClockedIn: boolean;
  currentShift: any | null;
  setLocation: (lat: number, lon: number, acc: number) => void;
  setClockedIn: (status: boolean, shift?: any) => void;
  clearLocation: () => void;
}

export const useGPSStore = create<GPSState>((set) => ({
  latitude: null,
  longitude: null,
  accuracy: null,
  isClockedIn: false,
  currentShift: null,
  
  setLocation: (latitude, longitude, accuracy) =>
    set({ latitude, longitude, accuracy }),
    
  setClockedIn: (isClockedIn, currentShift = null) => 
    set({ isClockedIn, currentShift }),
    
  clearLocation: () => 
    set({ latitude: null, longitude: null, accuracy: null }),
}));

interface AppState {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
