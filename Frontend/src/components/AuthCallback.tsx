import { useEffect } from 'react';
import { toast } from 'sonner';

interface AuthCallbackProps {
  onAuthSuccess: (user: any) => void;
}

export function AuthCallback({ onAuthSuccess }: AuthCallbackProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    const error = params.get('error');

    if (error || !token || !userParam) {
      toast.error('Authentication failed');
      window.location.href = '/';
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      onAuthSuccess(user);
      toast.success('Welcome!');
      window.location.href = '/';
    } catch {
      toast.error('Authentication failed');
      window.location.href = '/';
    }
  }, [onAuthSuccess]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  );
}
