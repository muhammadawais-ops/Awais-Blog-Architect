
import React from 'react';

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
  model: string;
}

interface PricingPageProps {
  onBack: () => void;
  onSelectPlan: (plan: PricingPlan) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack, onSelectPlan }) => {
  const plans: PricingPlan[] = [
    {
      name: "Starter Architect",
      price: "19.99",
      model: "Standard",
      features: [
        "50 Blogs per month",
        "Standard SEO Optimization",
        "Grade 8 Readability Check",
        "Email Support"
      ]
    },
    {
      name: "Flash Architect",
      price: "50.00",
      model: "Flash v3.1",
      recommended: true,
      features: [
        "500 Blogs per month",
        "Google Search Grounding",
        "ZeroGPT Bypass Engine",
        "Internal Link Automation",
        "Priority Generation Speed"
      ]
    },
    {
      name: "Pro Architect",
      price: "99.00",
      model: "Pro v3.1",
      features: [
        "Unlimited Generation",
        "Highest Reasoning Quality",
        "Advanced AEO Grounding",
        "Custom Brand Voice Tuning",
        "24/7 Priority Support"
      ]
    }
  ];

  return (
    <div className="animate-fadeIn py-12">
      <div className="text-center mb-16">
        <button 
          onClick={onBack}
          className="mb-8 text-indigo-600 font-bold flex items-center gap-2 mx-auto hover:underline"
        >
          <i className="fas fa-arrow-left"></i> Back to Architect
        </button>
        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Upgrade Your <span className="text-indigo-600">Architect</span> Plan</h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">The free tier has reached its limit. Choose a professional plan to continue building high-ranking content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <div 
            key={i} 
            className={`relative bg-white rounded-3xl p-8 border-2 transition-all hover:scale-105 ${
              plan.recommended ? 'border-indigo-600 shadow-2xl shadow-indigo-100' : 'border-slate-100 shadow-xl'
            }`}
          >
            {plan.recommended && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Most Popular</span>
            )}
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-800 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                <span className="text-slate-400 font-bold">/month</span>
              </div>
              <p className="mt-2 text-xs font-bold text-indigo-500 uppercase tracking-tighter">Powered by {plan.model}</p>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <i className="fas fa-check-circle text-indigo-500"></i>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onSelectPlan(plan)}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                plan.recommended 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-20 flex flex-col items-center justify-center gap-4 opacity-50">
        <div className="flex gap-6 grayscale">
          <i className="fab fa-cc-visa text-3xl"></i>
          <i className="fab fa-cc-mastercard text-3xl"></i>
          <i className="fab fa-cc-stripe text-3xl"></i>
          <i className="fab fa-cc-apple-pay text-3xl"></i>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Bank-Level 256-bit Encryption</p>
      </div>
    </div>
  );
};

export default PricingPage;
