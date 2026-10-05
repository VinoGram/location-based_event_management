import { useState, useEffect } from 'react';
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

export default function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState('earnings');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(currencyService.getCurrentCurrency());
  const [hasCreatedEvents, setHasCreatedEvents] = useState(false);

  const tabs = [
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'events', label: 'My Events', icon: '🎪' },
    { id: 'organize', label: 'Get Paid Setup', icon: '⚙️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ];

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
            onClick={() => {
              // Navigate to create event view
              const event = new CustomEvent('navigateToCreate');
              window.dispatchEvent(event);
            }}
          >
            Create Your First Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      {/* Navigation Tabs */}
      <div style={{ backgroundColor: '#171717', borderBottom: '1px solid #DDAA52' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center space-x-2 py-4 px-2 border-b-2 transition-all"
                  style={{
                    borderColor: activeTab === tab.id ? '#DDAA52' : 'transparent',
                    color: activeTab === tab.id ? '#DDAA52' : '#FFFFFF99'
                  }}
                >
                  <span>{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
            <CurrencySelector onCurrencyChange={setCurrency} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'earnings' && <EarningsContent earnings={earnings} payouts={payouts} totalEarnings={totalEarnings} totalTicketsSold={totalTicketsSold} formatAmount={formatAmount} />}
        {activeTab === 'events' && (
          <div className="p-6">
            <div className="text-center py-12" style={{ color: '#FFFFFF99' }}>
              <span className="text-4xl mb-4 block">🎪</span>
              <p>My Events section coming soon...</p>
            </div>
          </div>
        )}
        {activeTab === 'organize' && <OrganizerSetup />}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="text-center py-12" style={{ color: '#FFFFFF99' }}>
              <span className="text-4xl mb-4 block">📊</span>
              <p>Analytics section coming soon...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal 
          event={selectedEvent} 
          onClose={() => setShowCheckout(false)} 
        />
      )}
    </div>
  );
}

// Earnings Content Component
function EarningsContent({ earnings, payouts, totalEarnings, totalTicketsSold, formatAmount }) {
  return (
    <div className="p-6 space-y-6">
      {/* Earnings Overview */}
      <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: '#171717' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>This Month</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#000000' }}>
            <div className="text-2xl font-bold flex items-center" style={{ color: '#FB8B24' }}>
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {formatAmount(totalEarnings)}
            </div>
            <div className="text-sm" style={{ color: '#FFFFFF99' }}>Total Earnings</div>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#000000' }}>
            <div className="text-2xl font-bold flex items-center" style={{ color: '#DDAA52' }}>
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {totalTicketsSold}
            </div>
            <div className="text-sm" style={{ color: '#FFFFFF99' }}>Tickets Sold</div>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#000000' }}>
            <div className="text-2xl font-bold flex items-center" style={{ color: '#A31818' }}>
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z" />
              </svg>
              {earnings.length}
            </div>
            <div className="text-sm" style={{ color: '#FFFFFF99' }}>Active Events</div>
          </div>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: '#171717' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>Pending Payouts</h2>
        {payouts.length > 0 ? (
          <div className="space-y-3">
            {payouts.map((payout, index) => (
              <div key={index} className="border-l-4 p-4 rounded" style={{ borderColor: '#DDAA52', backgroundColor: '#000000' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium" style={{ color: '#FFFFFF' }}>{payout.event_name}</div>
                    <div className="text-sm" style={{ color: '#FFFFFF99' }}>
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
      <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: '#171717' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>Event Performance</h2>
        {earnings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#DDAA52' }}>
                  <th className="text-left py-2" style={{ color: '#FFFFFF99' }}>Event</th>
                  <th className="text-right py-2" style={{ color: '#FFFFFF99' }}>Tickets Sold</th>
                  <th className="text-right py-2" style={{ color: '#FFFFFF99' }}>Total Sales</th>
                  <th className="text-right py-2" style={{ color: '#FFFFFF99' }}>Your Earnings</th>
                  <th className="text-right py-2" style={{ color: '#FFFFFF99' }}>Platform Fees</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((event) => (
                  <tr key={event.event_id} className="border-b" style={{ borderColor: '#171717' }}>
                    <td className="py-3 font-medium" style={{ color: '#FFFFFF' }}>{event.title}</td>
                    <td className="text-right py-3" style={{ color: '#FFFFFF99' }}>{event.tickets_sold || 0}</td>
                    <td className="text-right py-3" style={{ color: '#FFFFFF99' }}>{formatAmount(event.total_sales || 0)}</td>
                    <td className="text-right py-3 font-medium" style={{ color: '#FB8B24' }}>
                      {formatAmount(event.organizer_earnings || 0)}
                    </td>
                    <td className="text-right py-3" style={{ color: '#CF0E0E' }}>
                      {formatAmount(event.platform_fees || 0)}
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
    </div>
  );
}

// Organizer Setup Component
function OrganizerSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bankConnected, setBankConnected] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg p-6" style={{ backgroundColor: '#171717', border: '1px solid #DDAA52' }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#DDAA52' }}>Get Paid Setup</h2>
            <p style={{ color: '#FFFFFF99' }}>Connect your bank account to receive payments</p>
            <div className="text-sm mt-2" style={{ color: '#DDAA52' }}>⏱️ Takes about 5 minutes</div>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className={`flex items-center ${
                step < 3 ? 'flex-1' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}
                     style={{
                       backgroundColor: currentStep >= step ? '#DDAA52' : '#FFFFFF33',
                       color: currentStep >= step ? '#000000' : '#FFFFFF99'
                     }}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-0.5 mx-4`}
                       style={{ backgroundColor: currentStep > step ? '#DDAA52' : '#FFFFFF33' }} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>Connect Bank Account</h3>
              <p className="mb-6" style={{ color: '#FFFFFF99' }}>Your earnings are protected and will be released after the event</p>
              <button 
                onClick={() => { setBankConnected(true); setCurrentStep(2); }}
                className="px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#DDAA52', color: '#000000' }}
              >
                Connect Bank Account
              </button>
              <div className="mt-4 text-sm" style={{ color: '#FFFFFF66' }}>
                💡 This money will be available 3 days after your event
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>Verify Identity</h3>
              <p className="mb-6" style={{ color: '#FFFFFF99' }}>Quick verification to keep payments secure</p>
              <button 
                onClick={() => { setIdentityVerified(true); setCurrentStep(3); }}
                className="px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#DDAA52', color: '#000000' }}
              >
                Verify Identity
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#DDAA52' }}>Setup Complete!</h3>
              <p className="mb-6" style={{ color: '#FFFFFF99' }}>You're ready to start earning from your events</p>
              <button className="px-6 py-3 rounded-lg font-semibold transition-colors"
                      style={{ backgroundColor: '#DDAA52', color: '#000000' }}>
                Create Your First Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Checkout Modal Component
function CheckoutModal({ event, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  
  const basePrice = 50.00;
  const serviceFeeRate = 0.10;
  const subtotal = basePrice * quantity;
  const serviceFee = subtotal * serviceFeeRate;
  const total = subtotal + serviceFee;

  const processPayment = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event?.id || 1, quantity })
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`${result.message} Ticket code: ${result.ticket.ticket_code}`);
        onClose();
      }
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 max-w-md w-full mx-4" style={{ backgroundColor: '#171717', border: '1px solid #DDAA52' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: '#DDAA52' }}>🎟️ Checkout</h2>
          <button onClick={onClose} style={{ color: '#FFFFFF99' }}>
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>{event?.title || 'Jazz Festival Ticket'}</h3>
          <div className="flex items-center space-x-4 mb-4">
            <label style={{ color: '#FFFFFF99' }}>Quantity:</label>
            <select 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="rounded px-3 py-1"
              style={{ backgroundColor: '#000000', border: '1px solid #DDAA52', color: '#FFFFFF' }}
            >
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between" style={{ color: '#FFFFFF99' }}>
            <span>{quantity} tickets × ${basePrice.toFixed(2)}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ color: '#FFFFFF99' }}>
            <span>Service Fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2" style={{ color: '#FFFFFF', borderColor: '#DDAA52' }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={processPayment}
          disabled={processing}
          className="w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#DDAA52', color: '#000000' }}
        >
          {processing ? 'Processing...' : 'Secure Checkout'}
        </button>

        <div className="mt-4 text-sm space-y-1" style={{ color: '#FFFFFF99' }}>
          <div>🔒 Secure payment powered by trusted providers</div>
          <div>📧 Get instant ticket confirmation</div>
          <div>↩️ No hidden fees - what you see is what you pay</div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerDashboard;