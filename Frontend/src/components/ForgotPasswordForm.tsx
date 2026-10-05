import { useState } from "react";
import { toast } from "sonner";
import { API_URL } from '../config';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        toast.success('OTP sent to your email!');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const otp = formData.get("otp") as string;

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (response.ok) {
        setStep('reset');
        toast.success('OTP verified! Set your new password.');
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successfully!');
        onBack();
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'email') {
    return (
      <div className="w-full">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Forgot Password</h3>
          <p className="text-white/70">Enter your email to receive a one-time password</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSendOTP}>
          <input
            className="auth-input-field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <button 
            className="auth-button" 
            type="submit" 
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <button
          onClick={onBack}
          className="w-full mt-4 text-white/70 hover:text-white text-sm underline"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="w-full">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Enter OTP</h3>
          <p className="text-white/70">Check your email for the one-time password</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleVerifyOTP}>
          <input
            className="auth-input-field"
            type="text"
            name="otp"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            required
          />
          <button 
            className="auth-button" 
            type="submit" 
            disabled={submitting}
          >
            {submitting ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={() => setStep('email')}
          className="w-full mt-4 text-white/70 hover:text-white text-sm underline"
        >
          Resend OTP
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
        <p className="text-white/70">Enter your new password</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="New Password"
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          required
        />
        <button 
          className="auth-button" 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}