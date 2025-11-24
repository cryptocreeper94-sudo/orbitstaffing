import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  workerId: string | null;
  companyName: string | null;
  setAuth: (token: string, workerId: string, companyName: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  workerId: null,
  companyName: null,
  setAuth: (token, workerId, companyName) =>
    set({ token, workerId, companyName }),
  logout: () => set({ token: null, workerId: null, companyName: null }),
}));

interface GPSState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isClockIn: boolean;
  setLocation: (lat: number, lon: number, acc: number) => void;
  setClockIn: (status: boolean) => void;
}

export const useGPSStore = create<GPSState>((set) => ({
  latitude: null,
  longitude: null,
  accuracy: null,
  isClockIn: false,
  setLocation: (latitude, longitude, accuracy) =>
    set({ latitude, longitude, accuracy }),
  setClockIn: (isClockIn) => set({ isClockIn }),
}));
