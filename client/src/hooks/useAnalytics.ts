import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

function getSessionId(): string {
  let sessionId = sessionStorage.getItem("orbit_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem("orbit_session_id", sessionId);
  }
  return sessionId;
}

function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Edge") || ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

export function useAnalytics() {
  const [location] = useLocation();
  const lastPage = useRef<string | null>(null);
  const pageStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const trackPageView = async () => {
      const currentPage = location || "/";
      
      if (lastPage.current === currentPage) return;
      
      const duration = lastPage.current ? Math.round((Date.now() - pageStartTime.current) / 1000) : undefined;
      
      if (lastPage.current && duration && duration > 0) {
        try {
          await fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              page: lastPage.current,
              duration,
              sessionId: getSessionId(),
              deviceType: getDeviceType(),
              browser: getBrowser(),
            }),
          });
        } catch (e) {
          // Silent fail for analytics
        }
      }
      
      lastPage.current = currentPage;
      pageStartTime.current = Date.now();
      
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: currentPage,
            referrer: document.referrer || null,
            sessionId: getSessionId(),
            deviceType: getDeviceType(),
            browser: getBrowser(),
          }),
        });
      } catch (e) {
        // Silent fail for analytics
      }
    };

    trackPageView();
  }, [location]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - pageStartTime.current) / 1000);
      if (lastPage.current && duration > 0) {
        navigator.sendBeacon(
          "/api/analytics/track",
          JSON.stringify({
            page: lastPage.current,
            duration,
            sessionId: getSessionId(),
            deviceType: getDeviceType(),
            browser: getBrowser(),
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
