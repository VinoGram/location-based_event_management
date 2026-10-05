import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';

export function PaymentCallback() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const session_id = urlParams.get('session_id');

        if (!session_id) {
          setStatus('failed');
          return;
        }

        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/payments/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ session_id })
        });

        if (response.ok) {
          setStatus('success');
          toast.success('Payment successful! Your ticket has been purchased.');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          setStatus('failed');
          toast.error('Payment verification failed');
        }
      } catch (error) {
        setStatus('failed');
        toast.error('Payment verification error');
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your ticket has been purchased successfully.</p>
            <p className="text-sm text-gray-500">Redirecting you back to the app...</p>
          </>
        )}
        
        {status === 'failed' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">There was an issue processing your payment.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-lg hover:from-pink-500 hover:to-rose-600"
            >
              Return to App
            </button>
          </>
        )}
      </div>
    </div>
  );
}
