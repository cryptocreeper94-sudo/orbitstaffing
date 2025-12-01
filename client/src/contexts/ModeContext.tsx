import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocation } from 'wouter';

type AppMode = 'live' | 'sandbox';

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
  isSandbox: boolean;
  isLive: boolean;
  enterSandbox: (returnPath?: string) => void;
  exitSandbox: () => void;
  returnPath: string | null;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const MODE_STORAGE_KEY = 'orbit_app_mode';
const RETURN_PATH_KEY = 'orbit_sandbox_return_path';

export function ModeProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mode, setModeState] = useState<AppMode>('live');
  const [returnPath, setReturnPath] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode') as AppMode | null;
    const storedMode = sessionStorage.getItem(MODE_STORAGE_KEY) as AppMode | null;
    const storedReturnPath = sessionStorage.getItem(RETURN_PATH_KEY);
    
    if (urlMode === 'sandbox' || urlMode === 'live') {
      setModeState(urlMode);
      sessionStorage.setItem(MODE_STORAGE_KEY, urlMode);
    } else if (storedMode) {
      setModeState(storedMode);
    }
    
    if (storedReturnPath) {
      setReturnPath(storedReturnPath);
    }
  }, []);

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    sessionStorage.setItem(MODE_STORAGE_KEY, newMode);
  }, []);

  const toggleMode = useCallback(() => {
    const newMode = mode === 'live' ? 'sandbox' : 'live';
    setMode(newMode);
  }, [mode, setMode]);

  const enterSandbox = useCallback((currentPath?: string) => {
    const pathToStore = currentPath || location;
    sessionStorage.setItem(RETURN_PATH_KEY, pathToStore);
    setReturnPath(pathToStore);
    setMode('sandbox');
  }, [location, setMode]);

  const exitSandbox = useCallback(() => {
    const storedPath = sessionStorage.getItem(RETURN_PATH_KEY) || '/';
    sessionStorage.removeItem(RETURN_PATH_KEY);
    setReturnPath(null);
    setMode('live');
    setLocation(storedPath);
  }, [setMode, setLocation]);

  const value: ModeContextType = {
    mode,
    setMode,
    toggleMode,
    isSandbox: mode === 'sandbox',
    isLive: mode === 'live',
    enterSandbox,
    exitSandbox,
    returnPath,
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

export function useSandboxData<T>(liveData: T | undefined, sandboxData: T): T | undefined {
  const { isSandbox } = useMode();
  return isSandbox ? sandboxData : liveData;
}
