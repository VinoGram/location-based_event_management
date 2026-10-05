import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return this.socket;
    if (this.socket) return this.socket; // already initialised, don't re-create
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 5000,
      timeout: 5000,
      transports: ['websocket'],
    });
    this.socket.on('connect_error', () => { /* silent */ });
    this.socket.connect();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinEvent(eventId: string) {
    if (this.socket) {
      this.socket.emit('join-event', eventId);
    }
  }

  onEventUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('event-update', callback);
    }
  }

  onNewRegistration(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new-registration', callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();