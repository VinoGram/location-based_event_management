import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

interface MyTicketsModalProps {
  onClose: () => void;
}

interface Ticket {
  id: string;
  event_title: string;
  event_date: string;
  event_time: string;
  event_location: string;
  quantity: number;
  total_price: number;
  status: string;
  purchase_date: string;
}

export default function MyTicketsModal({ onClose }: MyTicketsModalProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to view tickets');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/tickets/my-tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        toast.error('Failed to fetch tickets');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = (ticketId: string) => {
    toast.success('Ticket download started!');
    // In a real app, this would generate and download a PDF ticket
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#FFFFFF] font-bold text-xl">My Tickets</h3>
            <button onClick={onClose} className="text-[#FFFFFF]/70 hover:text-[#FFFFFF] text-2xl">&times;</button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DDAA52] mx-auto"></div>
              <p className="text-[#FFFFFF]/70 mt-4">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-[#FFFFFF]/40 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
              </svg>
              <h4 className="text-[#FFFFFF] font-semibold mb-2">No Tickets Yet</h4>
              <p className="text-[#FFFFFF]/70">Purchase tickets for events to see them here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-[#171717]/50 rounded-xl border border-[#DDAA52]/20 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-[#FFFFFF] font-semibold text-lg mb-2">{ticket.event_title}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-[#FFFFFF]/80 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>{new Date(ticket.event_date).toLocaleDateString()} at {ticket.event_time}</span>
                          </div>
                          
                          <div className="flex items-center text-[#FFFFFF]/80 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{ticket.event_location}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-[#FFFFFF]/80 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                            </svg>
                            <span>{ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''}</span>
                          </div>
                          
                          <div className="flex items-center text-[#FFFFFF]/80 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span>${ticket.total_price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'confirmed' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : ticket.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                          <span className="text-[#FFFFFF]/60 text-xs">
                            Purchased: {new Date(ticket.purchase_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {ticket.status === 'confirmed' && (
                          <button
                            onClick={() => downloadTicket(ticket.id)}
                            className="bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black px-4 py-2 rounded-lg text-sm font-medium hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Download</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
