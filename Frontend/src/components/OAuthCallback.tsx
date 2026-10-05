import { useEffect, useState } from 'react';
import { AuthService } from '../services/authService';

interface OAuthCallbackProps {
  onAuthSuccess: (user: any) => void;
}

export default function OAuthCallback({ onAuthSuccess }: OAuthCallbackProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { user, error } = await AuthService.handleOAuthCallback();
        
        if (error) {
          setError((error as any)?.message || 'Authentication failed');
        } else if (user) {
          onAuthSuccess(user);
        } else {
          setError('No user data received');
        }
      } catch (err) {
        setError('Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [onAuthSuccess]);

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%)' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#FB8B24,#DDAA52)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
          <p className="text-white font-semibold">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%)' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{ background: 'linear-gradient(90deg,#FB8B24,#DDAA52)', color: '#000', fontWeight: 700 }}
            className="px-6 py-2 rounded-xl"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}