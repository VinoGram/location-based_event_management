import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location_name: string;
  location_address: string;
  creator_id: string;
  flyerUrl?: string;
  price: number;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  users?: { first_name: string; last_name: string; email: string };
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  created_at: string;
  approved_events_count?: number;
}

export default function AdminPanel() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'users'>('events');

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/pending-events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch pending events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventAction = async (eventId: string, action: 'approve' | 'reject', reason?: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/events/${eventId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success(`Event ${action}d successfully`);
        fetchPendingEvents();
        setSelectedEvent(null);
      } else {
        toast.error(`Failed to ${action} event`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} event`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Admin Panel</h2>
        <div className="text-white/60 text-sm">
          Pending Events: {pendingEvents.filter(e => e.status === 'pending').length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          {pendingEvents.map((event) => (
            <div 
              key={event.id} 
              className={`bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer transition-all hover:bg-white/15 ${
                selectedEvent?.id === event.id ? 'ring-2 ring-purple-400' : ''
              }`}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                  <p className="text-white/60 text-sm">by {event.users?.first_name} {event.users?.last_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.status === 'pending' ? 'text-yellow-400 bg-yellow-500/20' :
                  event.status === 'approved' ? 'text-green-400 bg-green-500/20' :
                  'text-red-400 bg-red-500/20'
                }`}>
                  {event.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {event.location_name}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {event.category}
                </div>
              </div>

              <p className="text-white/70 text-sm mt-3 line-clamp-2">{event.description}</p>
            </div>
          ))}
        </div>

        {/* Event Details */}
        {selectedEvent && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 h-fit">
            <h3 className="text-xl font-bold text-white mb-4">Event Details</h3>
            
            {selectedEvent.flyerUrl && (
              <div className="mb-4">
                <img 
                  src={selectedEvent.flyerUrl} 
                  alt="Event flyer"
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
            )}

            <div className="space-y-3 mb-6">
              <div>
                <span className="text-white/60 text-sm">Creator:</span>
                <p className="text-white">{selectedEvent.users?.first_name} {selectedEvent.users?.last_name}</p>
                <p className="text-white/60 text-sm">{selectedEvent.users?.email}</p>
              </div>

              <div>
                <span className="text-white/60 text-sm">Location:</span>
                <p className="text-white">{selectedEvent.location_name}</p>
                <p className="text-white/60 text-sm">{selectedEvent.location_address}</p>
              </div>

              <div>
                <span className="text-white/60 text-sm">Price:</span>
                <p className="text-white">${selectedEvent.price}</p>
              </div>

              <div>
                <span className="text-white/60 text-sm">Submitted:</span>
                <p className="text-white">{new Date(selectedEvent.created_at).toLocaleString()}</p>
              </div>
            </div>

            {selectedEvent.status === 'pending' && (
              <div className="space-y-3">
                <button
                  onClick={() => handleEventAction(selectedEvent.id, 'approve')}
                  className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Approve Event
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Reason for rejection (optional):');
                    handleEventAction(selectedEvent.id, 'reject', reason || undefined);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all"
                >
                  Reject Event
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
