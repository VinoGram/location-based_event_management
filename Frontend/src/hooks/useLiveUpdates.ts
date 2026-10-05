import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

export function useLiveUpdates() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retries = 0;
    const MAX_RETRIES = 3;

    const connect = () => {
      if (retries >= MAX_RETRIES) return;
      try {
        eventSource = new EventSource(`${API_URL}/api/live/stream`);

        eventSource.onopen = () => {
          setConnected(true);
          retries = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'new_event':
                toast.success('New event available!');
                break;
              case 'event_approved':
                toast.info('Your event has been approved!');
                break;
              case 'feature_update':
                toast('New feature available!', {
                  action: { label: 'Refresh', onClick: () => window.location.reload() }
                });
                break;
            }
          } catch {}
        };

        eventSource.onerror = () => {
          setConnected(false);
          eventSource?.close();
          retries++;
          if (retries < MAX_RETRIES) {
            setTimeout(connect, 10000 * retries);
          }
        };
      } catch {}
    };

    connect();
    return () => { eventSource?.close(); };
  }, []);

  return { connected };
}