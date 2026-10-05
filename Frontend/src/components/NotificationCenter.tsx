import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(() => {});
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'event_reminder': return '⏰';
      case 'new_event_nearby': return '📍';
      case 'friend_request': return '👥';
      case 'event_approved': return '✅';
      case 'event_rejected': return '❌';
      default: return '🔔';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Notifications</h2>
          <p className="text-white/70 text-lg">Stay updated with your events and activities</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-2 px-4 rounded-xl font-medium"
          >
            Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
              <p className="text-white/70">You're all caught up! New notifications will appear here.</p>
            </div>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`backdrop-blur-md rounded-2xl border p-6 transition-all hover:bg-white/15 ${
                notification.isRead ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20 border-l-4'
              }`}
            >
              <div className="flex items-start space-x-4">
                <span className="text-2xl">{getIcon(notification.type)}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{notification.title}</h3>
                      <p className="text-white/80 mb-2">{notification.message}</p>
                      <p className="text-white/50 text-sm">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    {!notification.isRead && (
                      <button onClick={() => markAsRead(notification.id)} className="text-[#FB8B24] hover:text-[#DDAA52] font-medium text-sm">
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
