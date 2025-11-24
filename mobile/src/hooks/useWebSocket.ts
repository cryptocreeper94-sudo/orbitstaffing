import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store';

export function useWebSocket(onMessage: (data: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const { token, workerId } = useAuthStore();

  useEffect(() => {
    if (!token || !workerId) return;

    const wsUrl = 'ws://localhost:5000/ws';
    
    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        // Send auth message
        ws.send(JSON.stringify({ type: 'auth', token, workerId }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Parse error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      wsRef.current = ws;

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  }, [token, workerId, onMessage]);

  return wsRef.current;
}
