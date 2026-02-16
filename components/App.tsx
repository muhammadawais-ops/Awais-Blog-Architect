
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
        document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error("API Error:", err);
      // Showing detailed error to help the user identify key/quota issues
      let detailedError = err.message || "An unknown error occurred.";
      
      if (detailedError.includes('429')) {
        detailedError = "Google Quota Limit (429): Too many requests. Please wait 60 seconds. If this persists, your free key's daily limit might be over.";
      } else if (detailedError.includes('403')) {
        detailedError = "Permission Denied (403): Your API Key might be invalid or not enabled for Gemini 2.5.";
      } else if (detailedError.includes('API_KEY')) {
        detailedError = "Configuration Error: API_KEY not found in Vercel environment.";
      }

      setError(detailedError);
      setStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen pb-20 relative bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-lg">
              <i className="fas fa-layer-group text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Awais <span className="text-indigo-600">Blog Architect</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full">
              Stable Build v2.5
            </span>
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
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1 bg-white rounded-full border border-slate-200 shadow-sm">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimized for Free API Tier</p>
          </div>
        </div>

        <InputSection 
          inputs={inputs} 
          setInputs={setInputs} 
          onGenerate={handleGenerate} 
          isLoading={status === GenerationStatus.LOADING}
        />

        {error && (
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center text-center space-y-3 text-red-700 animate-fadeIn">
            <i className="fas fa-exclamation-circle text-3xl"></i>
            <div className="space-y-1">
              <p className="font-bold text-sm">System Message:</p>
              <p className="text-xs font-mono bg-white/50 p-2 rounded border border-red-100">{error}</p>
            </div>
            <button onClick={() => setStatus(GenerationStatus.IDLE)} className="text-xs font-bold underline text-red-800">Dismiss & Retry</button>
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
                <p className="text-slate-800 font-bold text-lg tracking-tight">Architecting Professional Content...</p>
                <p className="text-slate-500 text-xs italic">Optimizing single-pass generation to save API quota.</p>
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
