import { useState } from "react";
import { toast } from "sonner";
import { AuthService } from '../services/authService';
import { API_URL } from '../config';

interface AuthFormProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "", password: "", firstName: "", lastName: "",
    otp: "", newPassword: "", confirmPassword: ""
  });

  const inputClass = "w-full px-4 py-3 bg-[#0a0a0a] border border-[#DDAA52]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FB8B24]";
  const btnPrimary = "w-full bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 px-6 rounded-xl font-semibold hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all disabled:opacity-50";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      } else {
        toast.error(data.message || 'Authentication failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('OTP sent to your email!');
        setShowForgotPassword(false);
        setShowResetPassword(true);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp, newPassword: formData.newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Password reset successfully!');
        setShowResetPassword(false);
        setFormData({ email: "", password: "", firstName: "", lastName: "", otp: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="bg-[#171717] border border-[#DDAA52]/30 rounded-3xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Euforia" className="h-16 w-auto mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join Euforia'}
          </h2>
          <p className="text-white/60">
            {isLogin ? 'Sign in to discover events' : 'Create your free account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className={inputClass} placeholder="First Name" />
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className={inputClass} placeholder="Last Name" />
            </div>
          )}
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputClass} placeholder="Email" />
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className={inputClass} placeholder="Password" />
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-[#DDAA52]/20"></div>
            <span className="px-4 text-white/50 text-sm">or continue with</span>
            <div className="flex-1 border-t border-[#DDAA52]/20"></div>
          </div>

          <div className="mb-6">
            <button type="button" onClick={() => AuthService.signInWithGoogle()}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#DDAA52]/30 rounded-xl hover:border-[#FB8B24] transition-colors text-white font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="text-center space-y-3">
            {isLogin && (
              <button onClick={() => setShowForgotPassword(true)}
                className="text-[#DDAA52] hover:text-[#FB8B24] font-medium text-sm block mx-auto transition-colors">
                Forgot Password?
              </button>
            )}
            <button onClick={() => setIsLogin(!isLogin)}
              className="text-[#DDAA52] hover:text-[#FB8B24] font-medium transition-colors">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#171717] border border-[#DDAA52]/30 rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Reset Password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  required className={inputClass} placeholder="Enter your email" />
                <div className="flex space-x-3">
                  <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 rounded-xl font-semibold disabled:opacity-50">
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                  <button type="button" onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-3 bg-[#0a0a0a] text-white rounded-xl border border-[#DDAA52]/30 hover:border-[#FB8B24]">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPassword && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#171717] border border-[#DDAA52]/30 rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Set New Password</h3>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input type="text" name="otp" value={formData.otp} onChange={handleInputChange}
                  required maxLength={6} className={`${inputClass} text-center text-2xl tracking-widest`} placeholder="Enter OTP" />
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange}
                  required minLength={6} className={inputClass} placeholder="New password" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}
                  required minLength={6} className={inputClass} placeholder="Confirm new password" />
                <div className="flex space-x-3">
                  <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 rounded-xl font-semibold disabled:opacity-50">
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button type="button" onClick={() => setShowResetPassword(false)}
                    className="px-4 py-3 bg-[#0a0a0a] text-white rounded-xl border border-[#DDAA52]/30 hover:border-[#FB8B24]">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
