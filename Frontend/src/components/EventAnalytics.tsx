import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

interface Analytics {
  eventId: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  saves: number;
  shares: number;
  attendees: number;
  interested: number;
  comments: number;
  engagement: number;
  reach: number;
  createdAt: string;
}

export default function EventAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [filteredAnalytics, setFilteredAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Basic');
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/events/my-analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        setFilteredAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  const applyFilters = () => {
    let filtered = [...analytics];
    
    if (filters.location) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(event => event.status === filters.status);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(event => 
        new Date(event.createdAt) >= new Date(filters.dateFrom)
      );
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(event => 
        new Date(event.createdAt) <= new Date(filters.dateTo)
      );
    }
    
    setFilteredAnalytics(filtered);
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      dateFrom: '',
      dateTo: '',
      status: 'all'
    });
    setFilteredAnalytics(analytics);
  };

  const renderFilterContent = () => {
    switch (activeFilter) {
      case 'Location':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by location or title..."
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="w-full px-4 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
            />
          </div>
        );
      case 'Price':
        return (
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              className="px-4 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              className="px-4 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
            />
          </div>
        );
      case 'Date':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#FFFFFF]/70 text-sm mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-4 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
              />
            </div>
            <div>
              <label className="block text-[#FFFFFF]/70 text-sm mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-4 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
              />
            </div>
          </div>
        );
      case 'Advanced':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[#FFFFFF]/70 text-sm mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-xl text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-[#FFFFFF]/60">Basic view - showing all events</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">My Events Analytics</h2>
        <div className="text-white/60 text-sm">
          Total Events: {filteredAnalytics.length} / {analytics.length}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#171717]/50 backdrop-blur-xl rounded-2xl border border-[#DDAA52]/30 p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {['Basic', 'Location', 'Price', 'Date', 'Advanced'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black'
                  : 'bg-[#171717] text-[#FFFFFF]/70 hover:text-[#FFFFFF] border border-[#DDAA52]/30'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        {renderFilterContent()}
        
        {activeFilter !== 'Basic' && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black rounded-xl font-medium hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-[#A31818] text-[#FFFFFF] rounded-xl font-medium hover:bg-[#CF0E0E] transition-all"
                        >
              Reset
            </button>
          </div>
        )}
      </div>

      {filteredAnalytics.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 max-w-md mx-auto">
            <svg className="w-16 h-16 text-white/60 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
            <p className="text-white/70">Create your first event to see analytics here.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAnalytics.map((event) => (
            <div key={event.eventId} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-white/60 text-sm">
                  {new Date(event.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white/80 text-sm">Views</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{event.views}</div>
                </div>

                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span className="text-white/80 text-sm">Attendees</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{event.attendees}</div>
                </div>

                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                    <span className="text-white/80 text-sm">Interested</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{event.interested}</div>
                </div>

                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span className="text-white/80 text-sm">Shares</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{event.shares}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Engagement Rate</span>
                  <span className="text-white font-semibold">{event.engagement}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(event.engagement, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Reach: {event.reach}</span>
                  <span className="text-white/60">Saves: {event.saves}</span>
                  <span className="text-white/60">Comments: {event.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
