import { useState, useEffect, useRef, useCallback } from 'react';

// BUG-11: Use a ref for the callback to avoid reconnect loop
const useWebSocketFeed = (onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const backoffRef = useRef(1000);
  // Store latest onMessage in a ref — avoids stale closure and reconnect loop
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // BUG-11: Empty deps array — connect is created once, never recreated
  const connect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/threats`;

      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('✅ WebSocket Connected');
        setIsConnected(true);
        setError(null);
        backoffRef.current = 1000;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Use the ref, not the captured closure value
          if (onMessageRef.current) onMessageRef.current(data);
        } catch (err) {
          console.error('❌ Failed to parse WS message:', err);
        }
      };

      socket.onclose = (event) => {
        console.log(`🔌 WebSocket Closed: ${event.code}`);
        setIsConnected(false);

        if (event.code !== 1000) {
          const delay = backoffRef.current;
          console.log(`🔄 Reconnecting in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            backoffRef.current = Math.min(backoffRef.current * 2, 30000);
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
  }, []); // BUG-11: Empty deps — never re-creates connect

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
