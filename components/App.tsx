
import React, { useState } from 'react';
import { BlogInputs, GeneratedBlog, GenerationStatus, ViewState } from '../types';
import { generateSEOContent } from '../services/geminiService';
import InputSection from './InputSection';
import ResultSection from './ResultSection';
import PricingPage from './PricingPage';
import CheckoutModal from './CheckoutModal';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('GENERATOR');
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string} | null>(null);
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

  const handleGenerate = async () => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    try {
      const result = await generateSEOContent(inputs);
      setGeneratedBlog(result);
      setStatus(GenerationStatus.SUCCESS);
      setTimeout(() => {
        document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      if (err.message?.includes('Quota') || err.message?.includes('429')) {
        setStatus(GenerationStatus.QUOTA_EXCEEDED);
      } else {
        setError(err.message || 'Architect encountered a structural error.');
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
              alert("Plan Upgraded. Originality.AI Limits Increased.");
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
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-lg">
              <i className="fas fa-layer-group text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Awais <span className="text-indigo-600">Blog Architect</span>
              <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase font-black">EEAT/AEO PRO v8.1</span>
            </h1>
          </div>
          <button 
            onClick={() => setView('PRICING')}
            className="text-xs font-black text-indigo-600 border-2 border-indigo-50 border-b-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all uppercase tracking-widest"
          >
            Manage Plan
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            EEAT & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Niche-Adaptive</span> Content
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            High-ranking blogs with verified scientific grounding, real-time search, 
            and snippet-optimized FAQs for the Answer Engine era.
          </p>
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
              <i className="fas fa-crown text-3xl text-yellow-400"></i>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Upgrade for Pro Grounding</h3>
              <p className="text-indigo-200 text-sm max-w-md mx-auto">
                You've hit the architectural limit. Pro plans include advanced EEAT grounding and 99% Originality.AI human scores.
              </p>
            </div>
            <button 
              onClick={() => setView('PRICING')}
              className="px-10 py-4 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95"
            >
              Unlock Pro Architect
            </button>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700">
            <i className="fas fa-exclamation-circle"></i>
            <p className="font-medium">{error}</p>
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
                <p className="text-slate-800 font-bold text-lg">Architecting Expert Content...</p>
                <p className="text-slate-500 text-sm">Synthesizing niche-specific insights and AEO answers...</p>
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
