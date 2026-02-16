
import React, { useState } from 'react';
import { BlogInputs, GeneratedBlog, GenerationStatus } from '../types';
import { generateSEOContent } from '../services/geminiService';
import InputSection from './InputSection';
import ResultSection from './ResultSection';

const App: React.FC = () => {
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
        const el = document.getElementById('result-area');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error("Generation Error Details:", err);
      let message = "An unexpected error occurred.";
      
      const errorString = (JSON.stringify(err) + (err.message || "")).toLowerCase();
      
      if (err.message === "API_KEY_MISSING") {
        message = "Configuration Error: API_KEY is missing. Check your project environment.";
      } else if (errorString.includes('429')) {
        message = "Traffic Limit: Even the high-limit engine is busy. Please wait 15 seconds and try again.";
      } else if (errorString.includes('404')) {
        message = "Model Sync Error: Google is updating models in your region. This usually resolves in a few minutes.";
      } else {
        message = err.message || "Failed to generate content. Please try again.";
      }

      setError(message);
      setStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen pb-20 relative bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-600 p-2 rounded-lg shadow-emerald-200 shadow-lg">
              <i className="fas fa-bolt text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Awais <span className="text-emerald-600">Elite Architect</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full">
              Engine: Gemini 3 Elite Flash
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
            High-Velocity <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">SEO Intelligence</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            The perfect balance of Pro-level logic and high-capacity availability for seamless content creation.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1 bg-white rounded-full border border-slate-200 shadow-sm">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connected to High-Limit Engine</p>
          </div>
        </div>

        <InputSection 
          inputs={inputs} 
          setInputs={setInputs} 
          onGenerate={handleGenerate} 
          isLoading={status === GenerationStatus.LOADING}
        />

        {error && (
          <div className="mt-8 p-8 bg-white border-2 border-red-100 rounded-3xl flex flex-col items-center text-center space-y-4 shadow-xl animate-fadeIn">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-2xl text-red-500"></i>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">System Notice</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">{error}</p>
            </div>
            <button 
              onClick={() => setStatus(GenerationStatus.IDLE)} 
              className="px-8 py-3 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-black transition-all shadow-lg active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        <div id="result-area" className="mt-12">
          {status === GenerationStatus.LOADING && (
            <div className="flex flex-col items-center justify-center space-y-4 py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <i className="fas fa-bolt absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600"></i>
              </div>
              <div className="text-center">
                <p className="text-slate-800 font-bold text-lg tracking-tight">Architecting Content...</p>
                <p className="text-slate-500 text-xs italic">Using high-capacity engine for instant results.</p>
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
