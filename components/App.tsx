
import React, { useState } from 'react';
import { BlogInputs, GeneratedBlog, GenerationStatus } from '../types';
import { generateSEOContent } from '../services/geminiService';
import InputSection from './InputSection';
import ResultSection from './ResultSection';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BlogInputs>({
    topic: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    wordCount: 1200,
    websiteUrl: '',
    businessDetails: '',
    brandName: '',
    contentType: 'blog',
    searchIntent: 'Informational',
    backlinkUrl: '',
    anchorText: '',
    targetSiteContext: ''
  });

  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showKeySelector, setShowKeySelector] = useState(false);

  const handleGenerate = async () => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setShowKeySelector(false);

    try {
      const result = await generateSEOContent(inputs);
      setGeneratedBlog(result);
      setStatus(GenerationStatus.SUCCESS);
      
      setTimeout(() => {
        const el = document.getElementById('result-area');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error("Architect Error:", err);
      if (err.message === "API_KEY_MISSING") {
        setShowKeySelector(true);
      }
      setError(err.message || "Failed to generate content.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // After selecting, we assume success and try again or just let the user click generate
      setShowKeySelector(false);
      setError(null);
      setStatus(GenerationStatus.IDLE);
    } catch (err) {
      console.error("Key selection error:", err);
    }
  };

  return (
    <div className="min-h-screen pb-20 relative bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-slate-900 p-2 rounded-lg shadow-lg">
              <i className="fas fa-feather-pointed text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                Awais Blog Architect
              </h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Powered by Carpe Diem</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 bg-slate-50 px-3 py-1 rounded-full">
              System Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            20 Years Experienced Copywriter <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 underline decoration-indigo-200">Powered AI Blog Architect</span>
          </h2>
          <div className="flex flex-col items-center gap-3">
             <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
               Elite SEO, AEO, and AIO optimized content that bypasses AI detection and resonates with human emotions.
             </p>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
               By Muhammad Awais Ramzan
             </p>
             <div className="mt-4 inline-flex items-center gap-3 px-6 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                <div className="flex -space-x-2">
                   <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?u=awais1" alt="User 1" />
                   <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?u=awais2" alt="User 2" />
                   <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?u=awais3" alt="User 3" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Used by 500+ Content Strategists</p>
             </div>
          </div>
        </div>

        <InputSection 
          inputs={inputs} 
          setInputs={setInputs} 
          onGenerate={handleGenerate} 
          isLoading={status === GenerationStatus.LOADING}
        />

        {error && (
          <div className="mt-8 p-8 bg-white border border-red-200 rounded-3xl flex flex-col items-center text-center space-y-4 shadow-xl">
            <i className="fas fa-circle-exclamation text-4xl text-red-500"></i>
            <h3 className="text-lg font-bold text-slate-900">Architect Notice</h3>
            <p className="text-sm text-slate-600 max-w-md">
              {error === "API_KEY_MISSING" 
                ? "A valid Gemini API Key is required to access the high-end reasoning models. Please select a key from a paid Google Cloud project."
                : error}
            </p>
            {showKeySelector ? (
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={handleSelectKey} 
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-sm shadow-lg transition-all active:scale-95"
                >
                  Select API Key
                </button>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] text-slate-400 hover:text-indigo-600 underline font-bold uppercase tracking-widest"
                >
                  Learn about billing
                </a>
              </div>
            ) : (
              <button onClick={() => setStatus(GenerationStatus.IDLE)} className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm">Retry Session</button>
            )}
          </div>
        )}

        <div id="result-area" className="mt-16">
          {status === GenerationStatus.LOADING && (
            <div className="flex flex-col items-center justify-center space-y-6 py-24">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <i className="fas fa-pen-nib absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 text-xl animate-bounce"></i>
              </div>
              <div className="text-center">
                <p className="text-slate-900 font-black text-2xl tracking-tight">Architecting Masterpiece...</p>
                <p className="text-slate-500 text-sm italic font-medium">Injecting 20 years of copywriting experience into every paragraph.</p>
              </div>
            </div>
          )}

          {status === GenerationStatus.SUCCESS && generatedBlog && (
            <ResultSection blog={generatedBlog} />
          )}
        </div>
      </main>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            &copy; 2025 Awais Blog Architect &bull; Designed by Muhammad Awais Ramzan &bull; Powered by Carpe Diem
         </p>
      </footer>
    </div>
  );
};

export default App;
