import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { currencyService } from '../services/currencyService';
import CurrencySelector from './CurrencySelector';

interface EarningsData {
  event_id: number;
  title: string;
  tickets_sold: number;
  total_sales: number;
  organizer_earnings: number;
  platform_fees: number;
  base_price: number;
}

interface PayoutData {
  event_name: string;
  earnings_amount: number;
  payout_date: string;
  status: string;
}

const OrganizerEarningsDashboard: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(currencyService.getCurrentCurrency());
  const [hasCreatedEvents, setHasCreatedEvents] = useState(false);

  useEffect(() => {
    currencyService.initializeCurrency().then(setCurrency);
    fetchEarningsData();
    fetchPayoutsData();
  }, []);

  const formatAmount = (amount: number) => currencyService.formatPrice(amount);

  const fetchEarningsData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Check if user has events with ticket sales
      const { data: eventsWithSales } = await supabase
        .from('organizer_earnings_dashboard')
        .select('event_id')
        .eq('organizer_id', user.user.id)
        .gt('tickets_sold', 0);
      
      setHasCreatedEvents((eventsWithSales || []).length > 0);

      if ((eventsWithSales || []).length === 0) return;

      const { data, error } = await supabase
        .from('organizer_earnings_dashboard')
        .select('*')
        .eq('organizer_id', user.user.id);

      if (error) throw error;

      setEarnings(data || []);
      
      const total = data?.reduce((sum, event) => sum + (event.organizer_earnings || 0), 0) || 0;
      const tickets = data?.reduce((sum, event) => sum + (event.tickets_sold || 0), 0) || 0;
      
      setTotalEarnings(total);
      setTotalTicketsSold(tickets);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const fetchPayoutsData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('pending_payouts')
        .select('*')
        .eq('organizer_id', user.user.id);

      if (error) throw error;
      setPayouts(data || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!hasCreatedEvents) {
    return (
      <div className="max-w-4xl mx-auto p-6" style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
        <div className="text-center py-16">
          <svg className="w-24 h-24 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#FB8B24' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Start Earning Today</h2>
          <p className="text-lg mb-8" style={{ color: '#FFFFFF99' }}>Create an event and sell tickets to see your earnings dashboard</p>
          <button 
            className="px-8 py-3 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: '#FB8B24', color: '#000000' }}
            onClick={() => window.location.href = '/create-event'}
          >
            Create Your First Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white flex items-center">
        <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        Earnings Dashboard
      </h1>
      
      {/* Earnings Overview */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">This Month</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              ${totalEarnings.toFixed(2)}
            </div>
            <div className="text-sm text-gray-300">Total Earnings</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {totalTicketsSold}
            </div>
            <div className="text-sm text-gray-300">Tickets Sold</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-400 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z" />
              </svg>
              {earnings.length}
            </div>
            <div className="text-sm text-gray-300">Active Events</div>
          </div>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Pending Payouts</h2>
        {payouts.length > 0 ? (
          <div className="space-y-3">
            {payouts.map((payout, index) => (
              <div key={index} className="border-l-4 border-yellow-400 bg-gray-700 p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white">{payout.event_name}</div>
                    <div className="text-sm text-gray-300">
                      Available: {new Date(payout.payout_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: '#FB8B24' }}>
                      {formatAmount(payout.earnings_amount)}
                    </div>
                    <div className="text-sm capitalize" style={{ color: '#FFFFFF99' }}>
                      {payout.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8" style={{ color: '#FFFFFF99' }}>
            No pending payouts at this time
          </div>
        )}
      </div>

      {/* Event Breakdown */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Event Performance</h2>
        {earnings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 text-gray-300">Event</th>
                  <th className="text-right py-2 text-gray-300">Tickets Sold</th>
                  <th className="text-right py-2 text-gray-300">Total Sales</th>
                  <th className="text-right py-2 text-gray-300">Your Earnings</th>
                  <th className="text-right py-2 text-gray-300">Platform Fees</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((event) => (
                  <tr key={event.event_id} className="border-b border-gray-700">
                    <td className="py-3 font-medium text-white">{event.title}</td>
                    <td className="text-right py-3 text-gray-300">{event.tickets_sold || 0}</td>
                    <td className="text-right py-3 text-gray-300">${(event.total_sales || 0).toFixed(2)}</td>
                    <td className="text-right py-3 text-green-400 font-medium">
                      ${(event.organizer_earnings || 0).toFixed(2)}
                    </td>
                    <td className="text-right py-3 text-gray-400">
                      ${(event.platform_fees || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8" style={{ color: '#FFFFFF99' }}>
            No events with sales data yet
          </div>
        )}
      </div>

      {/* Get Paid Setup */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Get Paid Setup</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
            <span className="text-white">Connect Your Account</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white">Verify Identity</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white">Ready to Earn!</span>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-300 space-y-1">
          <div>Encrypted & Secure</div>
          <div>Payouts in 2-5 business days</div>
          <div>No hidden fees</div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerEarningsDashboard;