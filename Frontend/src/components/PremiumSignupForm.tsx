import { useState } from "react";
import { toast } from "sonner";
import { API_URL } from '../config';

interface PremiumSignupFormProps {
  onAuthSuccess: (user: any) => void;
  currency: { code: string; symbol: string };
}

export function PremiumSignupForm({ onAuthSuccess, currency }: PremiumSignupFormProps) {
  const [step, setStep] = useState<'signup' | 'payment'>('signup');
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data);
        setStep('payment');
        toast.success('Account created! Now complete your premium subscription.');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    setSubmitting(true);
    try {
      const amount = currency.code === 'USD' ? 9.99 : 
                   currency.code === 'GBP' ? 7.99 : 
                   currency.code === 'EUR' ? 8.99 : 9.99;

      const response = await fetch(`${API_URL}/api/payments/premium-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          amount,
          currency: currency.code
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        window.location.href = data.authorization_url;
      } else {
        toast.error(data.error || 'Payment initialization failed');
      }
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'payment') {
    const amount = currency.code === 'USD' ? '9.99' : 
                  currency.code === 'GBP' ? '7.99' : 
                  currency.code === 'EUR' ? '8.99' : '9.99';

    return (
      <div className="w-full">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Complete Your Premium Subscription</h3>
          <p className="text-white/70">Welcome {userData.user.firstName}! Complete payment to activate premium features.</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white">Premium Monthly</span>
            <span className="text-white font-bold">{currency.symbol}{amount}</span>
          </div>
          <div className="text-white/70 text-sm">
            • Unlimited event discovery
            • AI recommendations
            • Premium events access
            • 50% off first ticket
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-[#A31818] to-[#CF0E0E] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#CF0E0E] hover:to-[#A31818] transition-all shadow-lg disabled:opacity-50"
        >
          {submitting ? 'Processing...' : `Pay ${currency.symbol}${amount}/month`}
        </button>

        <button
          onClick={() => {
            sessionStorage.setItem('token', userData.token);
            sessionStorage.setItem('user', JSON.stringify(userData.user));
            onAuthSuccess(userData.user);
            toast.success('Account created! You can upgrade to premium later.');
          }}
          className="w-full mt-3 text-white/70 hover:text-white text-sm underline"
        >
          Skip for now (continue with free account)
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Create Premium Account</h3>
        <p className="text-white/70">Get premium features and exclusive access</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSignup}>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="auth-input-field"
            type="text"
            name="firstName"
            placeholder="First Name"
            required
          />
          <input
            className="auth-input-field"
            type="text"
            name="lastName"
            placeholder="Last Name"
            required
          />
        </div>
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button 
          className="auth-button bg-gradient-to-r from-[#A31818] to-[#CF0E0E] hover:from-[#CF0E0E] hover:to-[#A31818]" 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? "Creating Account..." : "Create Premium Account"}
        </button>
      </form>
    </div>
  );
}