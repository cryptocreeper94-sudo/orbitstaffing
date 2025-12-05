import { useState, useEffect } from 'react';

export function PWASplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (navigator as any).standalone === true;
    
    if (!isStandalone) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setIsVisible(false), 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-slate-900 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative">
        <img 
          src="/mascot/clean/orbit_mascot_presenting_certificate.png" 
          alt="Orby" 
          className="w-48 h-48 object-contain animate-bounce"
          style={{ animationDuration: '2s' }}
        />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-cyan-500/20 rounded-full blur-xl" />
      </div>
      
      <h1 className="mt-8 text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        ORBIT
      </h1>
      
      <p className="mt-2 text-gray-400 text-center px-8">
        Welcome back! Let's get to work.
      </p>
      
      <div className="mt-8 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
