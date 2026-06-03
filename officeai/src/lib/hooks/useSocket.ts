import { useEffect, useRef, useState, useCallback } from 'react';
import { GlobalRoomState, WsClientPayload, WsServerPayload } from '../../types/websocket';

export function useSocket(url: string, onAgentMessage?: (data: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [globalState, setGlobalState] = useState<GlobalRoomState | null>(null);
  
  const onAgentMessageRef = useRef(onAgentMessage);
  useEffect(() => {
    onAgentMessageRef.current = onAgentMessage;
  }, [onAgentMessage]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('[useSocket] Connected to server');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // Reset attempts on successful connect
    };

    ws.onmessage = (event) => {
      try {
        const payload: WsServerPayload = JSON.parse(event.data);
        if (payload.event === 'STATE_UPDATE' && payload.status === 'success') {
          setGlobalState(payload.data);
        } else if (payload.event === 'AGENT_MESSAGE') {
          console.log('[useSocket] Agent Message:', payload.data);
          if (onAgentMessageRef.current) {
            onAgentMessageRef.current(payload.data);
          }
        }
      } catch (err) {
        console.error('[useSocket] Error parsing message', err);
      }
    };

    ws.onclose = () => {
      console.log('[useSocket] Disconnected from server');
      setIsConnected(false);
      wsRef.current = null;
      
      // Exponential backoff reconnect
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const timeout = Math.pow(2, reconnectAttemptsRef.current) * 1000;
        console.log(`[useSocket] Reconnecting in ${timeout}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, timeout);
      } else {
        console.error('[useSocket] Max reconnect attempts reached');
      }
    };

    ws.onerror = (error) => {
      console.error('[useSocket] WebSocket Error:', error);
      ws.close(); // Triggers onclose for reconnect
    };

    wsRef.current = ws;
  }, [url]);

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

  const sendPayload = useCallback((payload: WsClientPayload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { isConnected, globalState, sendPayload };
}
