
import React, { useState, useEffect } from 'react';
import { BlogInputs, GeneratedBlog, GenerationStatus, ViewState } from '../types';
import { generateSEOContent } from '../services/geminiService';
import InputSection from './InputSection';
import ResultSection from './ResultSection';
import PricingPage from './PricingPage';
import CheckoutModal from './CheckoutModal';

const USAGE_KEY = 'awais_architect_usage_v8_2';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('GENERATOR');
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string} | null>(null);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [inputs, setInputs] = useState<BlogInputs>({
    topic: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    wordCount: 1200,
    websiteUrl: '',
    businessDetails: ''
  });

  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load usage and credits
  const getUsageData = () => {
    try {
      const data = localStorage.getItem(USAGE_KEY);
      const today = new Date().toDateString();
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.date === today) return parsed;
      }
      // Default for Free Tier: 1500 Credits (3 blogs worth)
      return { count: 0, credits: 1500, date: today, type: 'FREE' };
    } catch (e) {
      return { count: 0, credits: 1500, date: new Date().toDateString(), type: 'FREE' };
    }
  };

  const usage = getUsageData();
  const currentCredits = usage.credits;

  const handleGenerate = async () => {
    // 1. Check if tokens/credits are enough
    if (currentCredits < 500 && !isPaidUser) {
      setStatus(GenerationStatus.QUOTA_EXCEEDED);
      return;
    }

    setStatus(GenerationStatus.LOADING);
    setError(null);
    try {
      const result = await generateSEOContent(inputs);
      setGeneratedBlog(result);
      
      // 2. Success! Deduct Credits
      const cost = 500; // Fixed cost per architect session
      const newData = {
        ...usage,
        count: usage.count + 1,
        credits: Math.max(0, usage.credits - cost)
      };
      localStorage.setItem(USAGE_KEY, JSON.stringify(newData));
      
      setStatus(GenerationStatus.SUCCESS);
      setTimeout(() => {
        document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('Quota') || errMsg.includes('429')) {
        setStatus(GenerationStatus.SERVER_BUSY);
      } else {
        setError(errMsg || 'Architect encountered a structural error.');
        setStatus(GenerationStatus.ERROR);
      }
    }
  };

  if (view === 'PRICING' || view === 'CHECKOUT') {
    return (
      <div className="min-h-screen bg-slate-50 px-4">
        <PricingPage 
          onBack={() => setView('GENERATOR')} 
          onSelectPlan={(plan) => {
            setSelectedPlan(plan);
            setView('CHECKOUT');
          }}
        />
        {view === 'CHECKOUT' && selectedPlan && (
          <CheckoutModal 
            plan={selectedPlan} 
            onClose={() => setView('PRICING')} 
            onSuccess={() => {
              const premiumData = { 
                count: 0, 
                credits: 50000, 
                date: new Date().toDateString(), 
                type: 'PRO' 
              };
              localStorage.setItem(USAGE_KEY, JSON.stringify(premiumData));
              setIsPaidUser(true);
              alert("Plan Upgraded! 50,000 Personal Credits Added.");
              setView('GENERATOR');
              setStatus(GenerationStatus.IDLE);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-lg">
              <i className="fas fa-layer-group text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden md:block">
              Awais <span className="text-indigo-600">Blog Architect</span>
            </h1>
          </div>

          {/* Service Status & Global Limits Label */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                {isPaidUser ? 'Dedicated Node' : 'Shared Free Tier: 15 RPM'}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-xl">
               <i className={`fas ${isPaidUser ? 'fa-bolt text-yellow-500' : 'fa-database text-indigo-400'} text-xs`}></i>
               <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-black text-indigo-700 uppercase">{isPaidUser ? 'Personal Credits' : 'System Energy'}</span>
                  <span className="text-sm font-black text-slate-900">{currentCredits.toLocaleString()}</span>
               </div>
            </div>

            <button 
              onClick={() => setView('PRICING')}
              className="text-[10px] font-black text-indigo-600 border-2 border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all uppercase tracking-widest"
            >
              {isPaidUser ? 'Account' : 'Upgrade'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            EEAT & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Niche-Adaptive</span> Content
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            High-ranking blogs with verified scientific grounding and snippet-optimized FAQs.
          </p>
          {!isPaidUser && (
            <div className="mt-6 p-4 bg-slate-900 rounded-2xl text-white inline-flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Global Shared Capacity Indicator</p>
              <div className="flex gap-1">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className={`h-4 w-1.5 rounded-full ${i < 12 ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                ))}
              </div>
              <p className="mt-2 text-[9px] text-slate-400 font-medium italic">Shared 15 RPM Rate Limit — Use Wisely during peak hours</p>
            </div>
          )}
        </div>

        <InputSection 
          inputs={inputs} 
          setInputs={setInputs} 
          onGenerate={handleGenerate} 
          isLoading={status === GenerationStatus.LOADING}
        />

        {status === GenerationStatus.QUOTA_EXCEEDED && (
          <div className="mt-8 p-8 bg-indigo-900 rounded-3xl text-white shadow-2xl animate-fadeIn border border-indigo-700 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <i className="fas fa-battery-empty text-3xl text-red-400"></i>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">System Energy Depleted</h3>
              <p className="text-indigo-200 text-sm max-w-md mx-auto">
                Your shared free tier tokens (1,500 Credits) have been exhausted for today. 
                Unlock a private credit pool to continue generating expert content.
              </p>
            </div>
            <button 
              onClick={() => setView('PRICING')}
              className="px-10 py-4 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95"
            >
              Get Personal Credits
            </button>
          </div>
        )}

        {status === GenerationStatus.SERVER_BUSY && (
          <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center text-center space-y-4">
             <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <i className="fas fa-hourglass-half text-xl animate-bounce"></i>
             </div>
             <div>
                <h4 className="font-bold text-amber-900 tracking-tight uppercase text-xs mb-1">Shared RPM Limit Active</h4>
                <p className="text-amber-700 text-sm max-w-md">
                   You have credits, but the **Global Shared Free Tier** is currently receiving >15 requests per minute. 
                   Wait 45-60 seconds and try again.
                </p>
             </div>
             <button onClick={() => setStatus(GenerationStatus.IDLE)} className="text-xs font-bold text-amber-800 underline">Dismiss</button>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700">
            <i className="fas fa-exclamation-circle"></i>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div id="result-area" className="mt-12">
          {status === GenerationStatus.LOADING && (
            <div className="flex flex-col items-center justify-center space-y-4 py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <i className="fas fa-pen-nib absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600"></i>
              </div>
              <div className="text-center">
                <p className="text-slate-800 font-bold text-lg tracking-tight">Architecting Content...</p>
                <p className="text-slate-500 text-xs">Estimated Cost: <span className="text-indigo-600 font-black">500 Credits</span></p>
              </div>
            </div>
          )}

          {status === GenerationStatus.SUCCESS && generatedBlog && (
            <ResultSection blog={generatedBlog} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
