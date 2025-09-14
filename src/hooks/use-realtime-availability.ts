import { useState, useEffect, useCallback } from 'react';

interface AvailabilityUpdate {
  lotId: string;
  availability: number;
  timestamp: Date;
}

export function useRealtimeAvailability(lotIds: string[]) {
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (lotIds.length === 0) return;

    try {
      const response = await fetch('/api/lots/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lotIds }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  }, [lotIds]);

  useEffect(() => {
    // Initial fetch
    fetchAvailability();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchAvailability, 30000);

    // Set up WebSocket connection for real-time updates (if available)
    const wsUrl = process.env.NODE_ENV === 'development' 
      ? 'ws://localhost:3001/ws/availability'
      : 'wss://parcin.vercel.app/ws/availability';

    let ws: WebSocket | null = null;
    
    try {
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected for real-time availability');
      };

      ws.onmessage = (event) => {
        try {
          const update: AvailabilityUpdate = JSON.parse(event.data);
          setAvailability(prev => ({
            ...prev,
            [update.lotId]: update.availability,
          }));
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.log('WebSocket not available, using polling only');
      setIsConnected(false);
    }

    return () => {
      clearInterval(interval);
      if (ws) {
        ws.close();
      }
    };
  }, [fetchAvailability]);

  return {
    availability,
    isConnected,
    lastUpdate,
    refreshAvailability: fetchAvailability,
  };
}
