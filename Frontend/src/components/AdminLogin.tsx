import { useState } from 'react';
import { API_URL } from '../config';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        onLoginSuccess();
      } else {
        setError('Invalid PIN. Access denied.');
      }
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="bg-[#171717] border border-[#DDAA52]/30 rounded-3xl p-10 w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Euforia" className="h-14 w-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Admin Access</h2>
          <p className="text-white/50 text-sm mt-1">Enter your admin PIN to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            required
            autoFocus
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#DDAA52]/30 rounded-xl text-white text-center text-2xl tracking-widest placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]"
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pin.length === 0}
            className="w-full bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 rounded-xl font-bold text-lg hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
