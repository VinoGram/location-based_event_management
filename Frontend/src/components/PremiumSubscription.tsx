import { useState } from "react";
import { toast } from "sonner";
import { API_URL } from '../config';

interface PremiumFeature {
  name: string;
  free: string | boolean;
  premium: string | boolean;
}

const features: PremiumFeature[] = [
  { name: "Event Discovery Radius", free: "50km", premium: "Unlimited" },
  { name: "Event Filtering", free: "Basic categories", premium: "Advanced filters + AI recommendations" },
  { name: "Event Details", free: "Basic info", premium: "Full details + attendee insights" },
  { name: "RSVP Features", free: "Simple RSVP", premium: "Priority booking + waitlist" },
  { name: "Social Features", free: "Basic sharing", premium: "Friend connections + activity feed" },
  { name: "Event Creation", free: false, premium: "Create unlimited events" },
  { name: "Analytics", free: false, premium: "Event performance insights" },
  { name: "Customer Support", free: "Community", premium: "Priority support" },
];

const pricingPlans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    period: 'month',
    savings: null
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 59.99,
    period: 'year',
    savings: '40%'
  }
];

interface PremiumSubscriptionProps {
  user: any;
  onUpgrade: () => void;
}

export default function PremiumSubscription({ user, onUpgrade }: PremiumSubscriptionProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('annual');

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/premium/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: selectedPlan })
      });

      if (response.ok) {
        toast.success("Welcome to Premium! 🎉");
        onUpgrade();
      } else {
        const data = await response.json();
        toast.error(data.message || "Upgrade failed");
      }
    } catch (error) {
      toast.error("Upgrade failed. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const isPremium = user?.is_premium === true;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          {isPremium ? "Premium Features" : "Upgrade to Premium"}
        </h2>
        <p className="text-white/70 text-lg">
          {isPremium 
            ? "You're enjoying all premium features!" 
            : "Unlock the full potential of event discovery"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Free Tier */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <div className="text-4xl font-bold text-white mb-4">$0</div>
            <p className="text-white/70">Perfect for casual event discovery</p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-white/80">{feature.name}</span>
                <span className="text-sm text-white/60">
                  {typeof feature.free === 'boolean' 
                    ? (feature.free ? "✅" : "❌")
                    : feature.free
                  }
                </span>
              </div>
            ))}
          </div>

          {!isPremium && (
            <div className="mt-8 text-center">
              <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/60">Current Plan</span>
              </div>
            </div>
          )}
        </div>

        {/* Premium Tier */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-3xl border border-purple-400/30 p-8 relative overflow-hidden">
          {isPremium && (
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
          )}

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
            
            {/* Plan Selection */}
            {!isPremium && (
              <div className="flex bg-white/10 rounded-xl p-1 mb-4">
                {pricingPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all relative ${
                      selectedPlan === plan.id
                        ? 'bg-white text-purple-600'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {plan.name}
                    {plan.savings && (
                      <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Save {plan.savings}!
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <div className="text-4xl font-bold text-white mb-1">
              ${pricingPlans.find(p => p.id === selectedPlan)?.price || 9.99}
            </div>
            <div className="text-white/70 mb-4">
              per {pricingPlans.find(p => p.id === selectedPlan)?.period || 'month'}
              {selectedPlan === 'annual' && (
                <div className="text-green-400 text-sm font-medium">
                  Save $59.89 vs monthly!
                </div>
              )}
            </div>
            <p className="text-white/70">For serious event enthusiasts</p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-white/80">{feature.name}</span>
                <span className="text-sm text-white/80 font-medium">
                  {typeof feature.premium === 'boolean' 
                    ? (feature.premium ? "✅" : "❌")
                    : feature.premium
                  }
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            {isPremium ? (
              <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <span className="text-white font-medium">Premium Active</span>
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 relative"
              >
                {isUpgrading ? "Upgrading..." : `Upgrade ${selectedPlan === 'annual' ? 'Annual' : 'Monthly'}`}
                {selectedPlan === 'annual' && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    40% OFF
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Premium Benefits Showcase */}
      {!isPremium && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            What You Get with Premium
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h4 className="text-lg font-semibold text-white mb-2">Unlimited Discovery</h4>
              <p className="text-white/70 text-sm">
                Find events anywhere in the world, not just within 50km
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-lg font-semibold text-white mb-2">AI Recommendations</h4>
              <p className="text-white/70 text-sm">
                Get personalized event suggestions based on your interests
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-lg font-semibold text-white mb-2">Priority Access</h4>
              <p className="text-white/70 text-sm">
                Skip waitlists and get priority booking for popular events
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
