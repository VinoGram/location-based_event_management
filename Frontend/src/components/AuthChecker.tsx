import { useEffect, useState } from 'react';
import { resetAuth, checkAuthStatus } from '../utils/authReset';

export const AuthChecker = () => {
  const [authStatus, setAuthStatus] = useState<{
    hasToken: boolean;
    hasUser: boolean;
    token?: string;
    user?: any;
  }>({
    hasToken: false,
    hasUser: false
  });

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    
    setAuthStatus({
      hasToken: !!token,
      hasUser: !!user,
      token: token?.substring(0, 20) + '...' || 'None',
      user: user ? JSON.parse(user) : null
    });
  }, []);

  const clearAuth = () => {
    resetAuth();
  };

  const refreshStatus = () => {
    const status = checkAuthStatus();
    setAuthStatus({
      hasToken: status.hasToken,
      hasUser: status.hasUser,
      token: sessionStorage.getItem('token')?.substring(0, 20) + '...' || 'None',
      user: status.hasUser ? JSON.parse(sessionStorage.getItem('user') || '{}') : null
    });
  };

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
      <div className="text-sm">
        <strong>Auth Status:</strong>
        <br />
        Token: {authStatus.hasToken ? '✅' : '❌'} {authStatus.token}
        <br />
        User: {authStatus.hasUser ? '✅' : '❌'} {authStatus.user?.email || 'None'}
        <br />
        <div className="mt-2 space-x-2">
          <button 
            onClick={refreshStatus}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Refresh
          </button>
          <button 
            onClick={clearAuth}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Reset Auth
          </button>
        </div>
      </div>
    </div>
  );
};