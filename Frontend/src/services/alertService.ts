import { API_URL } from '../config';

export class AlertService {
  private static ws: WebSocket | null = null;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;

  static connect(isPremium: boolean) {
    if (!isPremium) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.ws = new WebSocket(`ws://localhost:5000/alerts?token=${token}`);
    
    this.ws.onopen = () => {
      console.log('Smart alerts connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = () => {
      console.log('Smart alerts disconnected');
      this.handleReconnect(isPremium);
    };

    this.ws.onerror = (error) => {
      console.error('Smart alerts error:', error);
    };
  }

  static disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  static handleReconnect(isPremium: boolean) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`Reconnecting to smart alerts (attempt ${this.reconnectAttempts})`);
        this.connect(isPremium);
      }, delay);
    }
  }

  static async enableAlerts(preferences: {
    recommendations: boolean;
    friendActivity: boolean;
    ticketAlerts: boolean;
    artistAlerts: boolean;
  }) {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/api/notifications/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update alert preferences:', error);
      return false;
    }
  }

  static async triggerTestAlert() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_URL}/api/notifications/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to trigger test alert:', error);
    }
  }
}