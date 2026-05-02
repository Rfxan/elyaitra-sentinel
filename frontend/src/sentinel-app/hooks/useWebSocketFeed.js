import { useState, useEffect, useRef, useCallback } from 'react';

const useWebSocketFeed = (onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const backoffRef = useRef(1000); // Start with 1s

  const connect = useCallback(() => {
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use the vite proxy /ws/threats -> localhost:8003/ws/threats
      const wsUrl = `${protocol}//${window.location.host}/ws/threats`;
      
      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('✅ WebSocket Connected');
        setIsConnected(true);
        setError(null);
        backoffRef.current = 1000; // Reset backoff on success
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (err) {
          console.error('❌ Failed to parse WS message:', err);
        }
      };

      socket.onclose = (event) => {
        console.log(`🔌 WebSocket Closed: ${event.code}`);
        setIsConnected(false);
        
        // Don't reconnect if it was a normal closure
        if (event.code !== 1000) {
          const delay = backoffRef.current;
          console.log(`🔄 Reconnecting in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            backoffRef.current = Math.min(backoffRef.current * 2, 30000); // Exponential backoff up to 30s
            connect();
          }, delay);
        }
      };

      socket.onerror = (err) => {
        console.error('❌ WebSocket Error:', err);
        setError('WebSocket connection failed');
        socket.close();
      };

    } catch (err) {
      console.error('❌ Connection setup failed:', err);
      setError(err.message);
    }
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { isConnected, error };
};

export default useWebSocketFeed;
