import { useMode } from '@/contexts/ModeContext';

export function useSandboxData<T>(
  liveData: T | undefined,
  sandboxData: T
): T | undefined {
  const { isSandbox } = useMode();
  return isSandbox ? sandboxData : liveData;
}

export function useSandboxDataWithFallback<T>(
  liveData: T | undefined,
  sandboxData: T,
  isLoading: boolean
): { data: T | undefined; isLoading: boolean; isUsingDemo: boolean } {
  const { isSandbox } = useMode();

  if (isSandbox) {
    return {
      data: sandboxData,
      isLoading: false,
      isUsingDemo: true,
    };
  }

  if (isLoading) {
    return {
      data: sandboxData,
      isLoading: true,
      isUsingDemo: true,
    };
  }

  return {
    data: liveData,
    isLoading: false,
    isUsingDemo: false,
  };
}

export function useSandboxAction<T extends (...args: any[]) => any>(
  liveAction: T,
  sandboxAction?: T
): T {
  const { isSandbox } = useMode();

  if (isSandbox && sandboxAction) {
    return sandboxAction;
  }

  if (isSandbox) {
    return ((...args: Parameters<T>) => {
      console.log('[Sandbox] Action simulated:', args);
      return Promise.resolve({ success: true, sandbox: true });
    }) as T;
  }

  return liveAction;
}

export function useSandboxMode() {
  const mode = useMode();
  return {
    ...mode,
    isDemo: mode.isSandbox,
    isProduction: mode.isLive,
  };
}
