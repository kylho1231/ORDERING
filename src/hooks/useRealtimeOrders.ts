import { useEffect, useState, useCallback, useRef } from 'react';
import { Order } from '../types';
import { api } from '../services/api';
import { playOrderChime } from '../utils/audio';
import { notify } from '../utils/alert';

export function useRealtimeOrders(enabled: boolean = true) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAlert = useCallback(() => {
    setNewOrderAlert(null);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    fetchOrders();

    // Setup SSE connection for real-time updates
    try {
      const es = new EventSource('/api/events');
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'ORDER_CREATED') {
            const newOrder = parsed.payload as Order;
            setOrders((prev) => {
              const exists = prev.some((o) => o.id === newOrder.id);
              if (exists) return prev;
              return [newOrder, ...prev];
            });

            setNewOrderAlert(newOrder);
            notify.newOrder(newOrder);
            if (soundEnabled) {
              playOrderChime();
            }
          } else if (parsed.type === 'ORDER_STATUS_UPDATED') {
            const updated = parsed.payload as Order;
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          }
        } catch (e) {
          // ignore heartbeat / ping parse errors
        }
      };

      es.onerror = () => {
        // Fallback polling will handle it if SSE encounters an issue
        es.close();
      };
    } catch (err) {
      console.debug('SSE initialization error:', err);
    }

    // Secondary periodic poll to guarantee fresh data even if backgrounded
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => {
      clearInterval(interval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, fetchOrders, soundEnabled]);

  return {
    orders,
    loading,
    refetch: fetchOrders,
    newOrderAlert,
    clearAlert,
    soundEnabled,
    setSoundEnabled,
  };
}
