import { useEffect, useRef, useCallback, useState } from "react";

interface WebSocketMessage {
  type: string;
  event?: string;
  room?: string;
  data?: any;
  timestamp?: string;
}

export function useWebSocket(
  room: string,
  onMessage?: (data: any, event?: string) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws?tenantId=${encodeURIComponent(
        localStorage.getItem("tenantId") || ""
      )}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
        setError(null);

        // Subscribe to room
        if (room) {
          ws.send(JSON.stringify({ type: "subscribe", room }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === "connected") {
            console.log("Connected to WebSocket server");
          } else if (message.type === "update" && onMessage) {
            onMessage(message.data, message.event);
          } else if (message.type === "personal" && onMessage) {
            onMessage(message.data, message.event);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Connection error");
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);

        // Attempt reconnection after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("WebSocket connection error:", error);
      setError("Failed to connect");
    }
  }, [room, onMessage]);

  const subscribe = useCallback((newRoom: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", room: newRoom }));
    }
  }, []);

  const unsubscribe = useCallback((roomToLeave: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "unsubscribe", room: roomToLeave })
      );
    }
  }, []);

  const send = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected");
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    connected,
    error,
    subscribe,
    unsubscribe,
    send,
  };
}
