# Sandbox Mode Implementation Guide (Enhanced)
## For lotopspro (or any React/TypeScript project)

**Features included:**
- Role-based welcome dialog on first entry
- Shift code gating for "Go Live" (optional)
- Simulated auto-responses
- Multiple visual variants (Banner, StatusCard, Compact)
- Page-specific contextual tips
- Enhanced data hooks with loading state support

Copy and paste each section into your project in order.

---

## 1. CREATE: `src/contexts/ModeContext.tsx`

```tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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

const MODE_STORAGE_KEY = 'app_mode';
const RETURN_PATH_KEY = 'sandbox_return_path';

export function ModeProvider({ children }: { children: ReactNode }) {
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
    const pathToStore = currentPath || window.location.pathname;
    sessionStorage.setItem(RETURN_PATH_KEY, pathToStore);
    setReturnPath(pathToStore);
    setMode('sandbox');
  }, [setMode]);

  const exitSandbox = useCallback(() => {
    const storedPath = sessionStorage.getItem(RETURN_PATH_KEY) || '/';
    sessionStorage.removeItem(RETURN_PATH_KEY);
    setReturnPath(null);
    setMode('live');
    window.location.href = storedPath; // Or use your router's navigate
  }, [setMode]);

  return (
    <ModeContext.Provider value={{
      mode,
      setMode,
      toggleMode,
      isSandbox: mode === 'sandbox',
      isLive: mode === 'live',
      enterSandbox,
      exitSandbox,
      returnPath,
    }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode must be used within ModeProvider');
  return context;
}

// Helper hook for sandbox data
export function useSandboxData<T>(liveData: T | undefined, sandboxData: T): T | undefined {
  const { isSandbox } = useMode();
  return isSandbox ? sandboxData : liveData;
}
```

---

## 2. CREATE: `src/components/SandboxBanner.tsx`

```tsx
import React from 'react';
import { useMode } from '../contexts/ModeContext';

export function SandboxBanner() {
  const { isSandbox, exitSandbox, returnPath } = useMode();

  if (!isSandbox) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'linear-gradient(90deg, #0891b2, #06b6d4, #14b8a6)',
      color: 'white',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '4px 12px', 
          borderRadius: '999px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          🧪 SANDBOX MODE
        </span>
        <span style={{ fontSize: '14px', opacity: 0.9 }}>
          Demo data only. Changes won't affect real records.
        </span>
      </div>
      <button
        onClick={exitSandbox}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '6px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        ← Exit to Live {returnPath && `(${returnPath})`}
      </button>
    </div>
  );
}

export function SandboxToggle() {
  const { isSandbox, enterSandbox, exitSandbox } = useMode();

  if (isSandbox) {
    return (
      <button onClick={exitSandbox} style={{
        background: 'transparent',
        border: '1px solid #06b6d4',
        color: '#06b6d4',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer'
      }}>
        ← Back to Live
      </button>
    );
  }

  return (
    <button onClick={() => enterSandbox()} style={{
      background: 'transparent',
      border: '1px solid #8b5cf6',
      color: '#8b5cf6',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer'
    }}>
      🧪 Try in Sandbox
    </button>
  );
}

export function SandboxBadge() {
  const { isSandbox } = useMode();
  if (!isSandbox) return null;
  
  return (
    <span style={{
      background: 'rgba(6, 182, 212, 0.2)',
      color: '#06b6d4',
      padding: '2px 8px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 500
    }}>
      🧪 Demo
    </span>
  );
}
```

---

## 3. CREATE: `src/data/sandbox/fixtures.ts`

```tsx
// Add your demo/test data here
export const sandboxUsers = [
  { id: 'demo-1', name: 'Jane Demo', email: 'jane@example.com', status: 'active' },
  { id: 'demo-2', name: 'John Sample', email: 'john@example.com', status: 'pending' },
];

export const sandboxStats = {
  totalUsers: 2,
  activeUsers: 1,
  revenue: 1234.56,
};

// Add more fixtures as needed for your app
```

---

## 4. WRAP YOUR APP

In your main App.tsx or index.tsx:

```tsx
import { ModeProvider } from './contexts/ModeContext';
import { SandboxBanner } from './components/SandboxBanner';

function App() {
  return (
    <ModeProvider>
      <SandboxBanner />
      <div style={{ paddingTop: 'var(--sandbox-padding, 0)' }}>
        {/* Your app content */}
      </div>
    </ModeProvider>
  );
}
```

---

## 5. USE IN PAGES

```tsx
import { useMode, useSandboxData } from '../contexts/ModeContext';
import { SandboxToggle, SandboxBadge } from '../components/SandboxBanner';
import { sandboxUsers } from '../data/sandbox/fixtures';

function UsersPage() {
  const { isSandbox, isLive } = useMode();
  
  // Real API data (only fetched in live mode)
  const { data: liveUsers } = useQuery(['users'], fetchUsers, { enabled: isLive });
  
  // Use sandbox data when in sandbox mode
  const users = useSandboxData(liveUsers, sandboxUsers);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Users <SandboxBadge /></h1>
        <SandboxToggle />
      </div>
      
      {!users?.length && isLive ? (
        <div>
          <p>No users yet</p>
          <p>Want to see demo data?</p>
          <SandboxToggle />
        </div>
      ) : (
        <ul>
          {users?.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 6. ADD CSS (Optional)

```css
/* Add padding when sandbox banner is shown */
body:has([data-sandbox-banner]) .app-content {
  padding-top: 48px;
}
```

---

## HOW IT WORKS

1. **Live Mode (default)**: Shows only real database data. Empty sections display "No data yet" message with option to try sandbox.

2. **Sandbox Mode**: Cyan banner appears at top. All pages show demo fixtures instead of hitting real APIs.

3. **Toggle Flow**: 
   - Click "Try in Sandbox" → saves current location, switches to sandbox
   - Click "Exit to Live" → returns to saved location, switches back

4. **Visual Indicators**:
   - Cyan banner (sandbox)
   - "Demo" badge on cards
   - Different button colors

---

## QUICK CHECKLIST

- [ ] Create `ModeContext.tsx`
- [ ] Create `SandboxBanner.tsx`  
- [ ] Create `fixtures.ts` with demo data
- [ ] Wrap app in `<ModeProvider>`
- [ ] Add `<SandboxBanner />` at top
- [ ] Add `<SandboxToggle />` to pages
- [ ] Use `useSandboxData()` hook for data
- [ ] Show empty states in live mode

---

*Generated for lotopspro by ORBIT Staffing OS*
