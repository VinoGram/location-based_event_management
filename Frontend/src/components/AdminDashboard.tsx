import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';
import EventDiscovery from './EventDiscovery';

interface Analytics {
  totalUsers: number;
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  rejectedEvents: number;
  totalRSVPs: number;
  totalViews: number;
  totalComments: number;
  totalRatings: number;
  averageRating: number;
  topCategories: Array<{ category: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location_name: string;
  location_address?: string;
  flyer_url?: string;
  hasTickets?: boolean;
  price?: number;
  tags?: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  users?: { first_name: string; last_name: string; email: string };
  location?: { latitude: number; longitude: number; name: string; address: string };
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_suspended?: boolean;
  created_at: string;
  approved_events_count?: number;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'users' | 'discover'>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const getToken = () => localStorage.getItem('adminToken');

  useEffect(() => {
    fetchAnalytics();
    fetchEvents();
    fetchUsers();
  }, []);

  const fetchAnalytics = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/events/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events');
    }
  };

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleEventAction = async (eventId: string, status: 'approved' | 'rejected') => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/events/${eventId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Event ${status} successfully`);
        fetchEvents();
        fetchAnalytics();
        
        // Refresh discover iframe if approved
        if (status === 'approved') {
          const iframe = document.querySelector('iframe[title="Event Discovery"]') as HTMLIFrameElement;
          if (iframe) {
            iframe.src = iframe.src;
          }
        }
      }
    } catch (error) {
      toast.error(`Failed to ${status} event`);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'delete') => {
    const token = getToken();
    if (!token) return;

    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const url = action === 'delete' 
        ? `${API_URL}/api/admin/users/${userId}`
        : `${API_URL}/api/admin/users/${userId}/${action}`;
      
      const response = await fetch(url, {
        method: action === 'delete' ? 'DELETE' : 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success(`User ${action}ed successfully`);
        fetchUsers();
        fetchAnalytics();
      } else {
        const data = await response.json();
        toast.error(data.message || `Failed to ${action} user`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`);
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
        <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black'
                : 'text-white/60 hover:text-white hover:bg-[#DDAA52]/10'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center ${
              activeTab === 'events'
                ? 'bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black'
                : 'text-white/60 hover:text-white hover:bg-[#DDAA52]/10'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Events ({analytics?.pendingEvents || 0})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black'
                : 'text-white/60 hover:text-white hover:bg-[#DDAA52]/10'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            Users ({analytics?.totalUsers || 0})
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center ${
              activeTab === 'discover'
                ? 'bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black'
                : 'text-white/60 hover:text-white hover:bg-[#DDAA52]/10'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            Discover
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-all flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
            <div className="bg-gradient-to-r from-[#FB8B24]/20 to-[#DDAA52]/20 backdrop-blur-md rounded-2xl border border-[#FB8B24]/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#FB8B24] text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-white">{analytics.totalUsers}</p>
                </div>
                <svg className="w-8 h-8 text-[#FB8B24]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#DDAA52]/20 to-[#FB8B24]/20 backdrop-blur-md rounded-2xl border border-[#DDAA52]/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#DDAA52] text-sm font-medium">Total Events</p>
                  <p className="text-3xl font-bold text-white">{analytics.totalEvents}</p>
                </div>
                <svg className="w-8 h-8 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#A31818]/20 to-[#CF0E0E]/20 backdrop-blur-md rounded-2xl border border-[#A31818]/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A31818] text-sm font-medium">Pending Events</p>
                  <p className="text-3xl font-bold text-white">{analytics.pendingEvents}</p>
                </div>
                <svg className="w-8 h-8 text-[#A31818]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#CF0E0E]/20 to-[#A31818]/20 backdrop-blur-md rounded-2xl border border-[#CF0E0E]/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#CF0E0E] text-sm font-medium">Total RSVPs</p>
                  <p className="text-3xl font-bold text-white">{analytics.totalRSVPs}</p>
                </div>
                <svg className="w-8 h-8 text-[#CF0E0E]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Top Categories</h3>
              <div className="space-y-3">
                {analytics.topCategories.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="text-white">{cat.category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] h-2 rounded-full"
                          style={{ width: `${(cat.count / analytics.topCategories[0]?.count) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white/60 text-sm">{cat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#FB8B24] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-white text-sm">{activity.description}</p>
                      <p className="text-white/60 text-xs">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
            <div className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 p-6 text-center">
              <svg className="w-12 h-12 text-[#DDAA52] mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <p className="text-2xl font-bold text-white">{analytics.averageRating.toFixed(1)}</p>
              <p className="text-white/60 text-sm">Average Rating</p>
              <p className="text-white/60 text-xs">{analytics.totalRatings} total ratings</p>
            </div>
            
            <div className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 p-6 text-center">
              <svg className="w-12 h-12 text-[#FB8B24] mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <p className="text-2xl font-bold text-white">{analytics.totalViews}</p>
              <p className="text-white/60 text-sm">Total Views</p>
            </div>
            
            <div className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 p-6 text-center">
              <svg className="w-12 h-12 text-[#A31818] mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <p className="text-2xl font-bold text-white">{analytics.totalComments}</p>
              <p className="text-white/60 text-sm">Total Comments</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                  <p className="text-white/60 text-sm">by {event.users?.first_name} {event.users?.last_name}</p>
                  <div className="flex items-center text-white/60 text-xs mt-1 space-x-3">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {event.location_name}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-all flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    View Details
                  </button>
                  {event.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleEventAction(event.id, 'approved')}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Approve
                      </button>
                      <button
                        onClick={() => handleEventAction(event.id, 'rejected')}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {user.first_name} {user.last_name}
                    {user.is_admin && <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">ADMIN</span>}
                  </h3>
                  <p className="text-white/60 text-sm">{user.email}</p>
                  <p className="text-white/60 text-xs mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                  <p className="text-white/60 text-xs">Approved Events: {user.approved_events_count || 0}</p>
                  {user.is_suspended && (
                    <span className="inline-block mt-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                      SUSPENDED
                    </span>
                  )}
                </div>
                {!user.is_admin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUserAction(user.id, 'suspend')}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        user.is_suspended 
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      }`}
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        {user.is_suspended ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                        )}
                      </svg>
                      {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button
                      onClick={() => handleUserAction(user.id, 'delete')}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 9V6a1 1 0 011-1z" clipRule="evenodd" />
                        <path d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 8a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 p-6">
          <EventDiscovery 
            userLocation={null}
            currency={{ code: 'USD', symbol: '$' }}
          />
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#171717] rounded-2xl border border-[#FB8B24]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-[#FB8B24]">Event Details</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Event Flyer */}
                {selectedEvent.flyer_url && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Event Flyer</h3>
                    <img
                      src={selectedEvent.flyer_url}
                      alt="Event Flyer"
                      className="w-full max-w-md mx-auto rounded-lg border border-[#DDAA52]/20"
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
                  <div className="bg-[#171717]/50 rounded-xl p-4 space-y-3">
                    <div>
                      <span className="text-[#DDAA52] text-sm font-medium">Title:</span>
                      <p className="text-white">{selectedEvent.title}</p>
                    </div>
                    <div>
                      <span className="text-[#DDAA52] text-sm font-medium">Description:</span>
                      <p className="text-white/80">{selectedEvent.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[#DDAA52] text-sm font-medium">Category:</span>
                        <p className="text-white">{selectedEvent.category}</p>
                      </div>
                      <div>
                        <span className="text-[#DDAA52] text-sm font-medium">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedEvent.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          selectedEvent.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {selectedEvent.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Schedule</h3>
                  <div className="bg-[#171717]/50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[#DDAA52] text-sm font-medium">Date:</span>
                        <p className="text-white">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-[#DDAA52] text-sm font-medium">Time:</span>
                        <p className="text-white">{selectedEvent.time}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Location</h3>
                  <div className="bg-[#171717]/50 rounded-xl p-4 space-y-3">
                    <div>
                      <span className="text-[#DDAA52] text-sm font-medium">Venue:</span>
                      <p className="text-white">{selectedEvent.location_name}</p>
                    </div>
                    {selectedEvent.location_address && (
                      <div>
                        <span className="text-[#DDAA52] text-sm font-medium">Address:</span>
                        <p className="text-white/80">{selectedEvent.location_address}</p>
                      </div>
                    )}
                    {selectedEvent.location && selectedEvent.location.latitude !== 0 && (
                      <div>
                        <span className="text-[#DDAA52] text-sm font-medium">Coordinates:</span>
                        <p className="text-white/60 text-sm font-mono">
                          {selectedEvent.location.latitude.toFixed(6)}, {selectedEvent.location.longitude.toFixed(6)}
                        </p>
                        <div className="mt-2 rounded-lg overflow-hidden border border-[#DDAA52]/20" style={{height:'180px'}}>
                          <iframe
                            title="Event Map"
                            width="100%"
                            height="180"
                            style={{border:0}}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedEvent.location.longitude-0.01},${selectedEvent.location.latitude-0.01},${selectedEvent.location.longitude+0.01},${selectedEvent.location.latitude+0.01}&layer=mapnik&marker=${selectedEvent.location.latitude},${selectedEvent.location.longitude}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                {selectedEvent.hasTickets && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Pricing</h3>
                    <div className="bg-[#171717]/50 rounded-xl p-4">
                      <div>
                        <span className="text-[#DDAA52] text-sm font-medium">Price:</span>
                        <p className="text-white">${selectedEvent.price || 0}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#FB8B24]/20 text-[#DDAA52] rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Creator Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Event Creator</h3>
                  <div className="bg-[#171717]/50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[#DDAA52] text-sm font-medium">Name:</span>
                        <p className="text-white">{selectedEvent.users?.first_name} {selectedEvent.users?.last_name}</p>
                      </div>
                      <div>
                        <span className="text-[#DDAA52] text-sm font-medium">Email:</span>
                        <p className="text-white/80">{selectedEvent.users?.email}</p>
                      </div>
                    </div>
                    {selectedEvent.created_at && (
                      <div className="mt-3">
                        <span className="text-[#DDAA52] text-sm font-medium">Submitted:</span>
                        <p className="text-white/60 text-sm">{new Date(selectedEvent.created_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedEvent.status === 'pending' && (
                  <div className="flex space-x-4 pt-4 border-t border-[#DDAA52]/20">
                    <button
                      onClick={() => {
                        handleEventAction(selectedEvent.id, 'approved');
                        setSelectedEvent(null);
                      }}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Approve Event
                    </button>
                    <button
                      onClick={() => {
                        handleEventAction(selectedEvent.id, 'rejected');
                        setSelectedEvent(null);
                      }}
                      className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Reject Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}