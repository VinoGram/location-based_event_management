import { useState, useEffect } from "react";
import AuthForm from "./AuthForm";
import { detectCurrency } from '../utils/currency';

interface HomepageProps {
  onAuthSuccess: (user: any) => void;
}

export default function Homepage({ onAuthSuccess }: HomepageProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$' });

  useEffect(() => {
    detectCurrency().then(setCurrency);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-[#171717] backdrop-blur-md border-b border-[#DDAA52]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Euforia Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-2xl font-bold text-[#FFFFFF]">Euforia</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">

          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FFFFFF] mb-6">
            Discover Amazing
            <span className="bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] bg-clip-text text-transparent"> Events</span>
            <br />Near You
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-[#FFFFFF]/80 mb-10 max-w-3xl mx-auto px-2">
            Find concerts, festivals, workshops, and more happening in your area. 
            Connect with your community and never miss out on the experiences that matter to you.
          </p>

          <div className="flex justify-center mb-12">
            <button
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 sm:py-4 px-6 sm:px-8 rounded-xl font-semibold text-base sm:text-lg hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all shadow-lg"
            >
              Start Exploring Euforia
            </button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-[#171717] backdrop-blur-md rounded-2xl border border-[#DDAA52]/30 p-8 overflow-hidden">
              <video 
                className="w-full h-full object-cover rounded-lg" 
                autoPlay 
                loop 
                muted 
                playsInline
                preload="metadata"
                style={{ maxWidth: '100%', height: 'auto' }}
              >
                <source src="/videos/event1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="bg-[#171717] backdrop-blur-md rounded-2xl border border-[#DDAA52]/30 p-8 overflow-hidden">
              <video 
                className="w-full h-full object-cover rounded-lg" 
                autoPlay 
                loop 
                muted 
                playsInline
                preload="metadata"
                style={{ maxWidth: '100%', height: 'auto' }}
              >
                <source src="/videos/event2.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="bg-[#171717] backdrop-blur-md rounded-2xl border border-[#DDAA52]/30 p-8 overflow-hidden">
              <video 
                className="w-full h-full object-cover rounded-lg" 
                autoPlay 
                loop 
                muted 
                playsInline
                preload="metadata"
                style={{ maxWidth: '100%', height: 'auto' }}
              >
                <source src="/videos/event3.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Features */}
          <div className="bg-[#171717]/50 backdrop-blur-md rounded-3xl border border-[#DDAA52]/20 p-6 sm:p-12">
            <h2 className="text-3xl font-bold text-[#FFFFFF] mb-8">Everything You Need</h2>
            
            <div className="bg-gradient-to-br from-[#171717] to-[#171717]/80 rounded-2xl border border-[#DDAA52]/30 p-8 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-[#DDAA52] mb-4">Free </h3>
              <div className="text-4xl font-bold text-[#DDAA52] mb-4">{currency.symbol}0</div>
              <p className="text-[#FFFFFF]/70 mb-6">All features included, no hidden costs</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-[#FFFFFF]">
                  <svg className="w-5 h-5 mr-3 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited event discovery radius
                </li>
                <li className="flex items-center text-[#FFFFFF]">
                  <svg className="w-5 h-5 mr-3 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced filtering & sorting
                </li>
                <li className="flex items-center text-[#FFFFFF]">
                  <svg className="w-5 h-5 mr-3 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  AI-powered recommendations
                </li>
                <li className="flex items-center text-[#FFFFFF]">
                  <svg className="w-5 h-5 mr-3 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Group planning & chat
                </li>
                <li className="flex items-center text-[#FFFFFF]">
                  <svg className="w-5 h-5 mr-3 text-[#DDAA52]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Event creation & management
                </li>
              </ul>
              
              <button
                onClick={() => setShowAuth(true)}
                className="w-full bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 px-6 rounded-xl font-medium hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all shadow-lg"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-4">
          <div className="relative w-full max-w-md mx-4">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
            <AuthForm onAuthSuccess={(user) => { onAuthSuccess(user); setShowAuth(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}