import { useState } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  amount: number;
  currency: { code: string; symbol: string };
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, event, amount, currency, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      
      // Initialize payment
      const response = await fetch(`${API_URL}/api/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: event.id,
          amount,
          currency: currency.code
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to payment page
        window.location.href = data.authorization_url;
      } else {
        toast.error(data.error || 'Payment initialization failed');
      }
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Purchase Ticket</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-900">{event.title}</h4>
          <p className="text-gray-600">{event.date} at {event.time}</p>
          <p className="text-gray-600">{event.venue}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount:</span>
            <span className="text-xl font-bold text-gray-900">{currency.symbol}{amount}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-lg hover:from-pink-500 hover:to-rose-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
