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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}