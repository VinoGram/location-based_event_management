import { useEffect } from 'react';

declare global { interface Window { gtag?: (...args: any[]) => void; } }

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
      window.location.href = '/';
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      onAuthSuccess(user);
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'login', { method: 'Google' });
      }
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  }, [onAuthSuccess]);

  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%)' }} className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#FB8B24,#DDAA52)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
        <p className="text-white font-semibold">Completing authentication...</p>
      </div>
    </div>
  );
}
