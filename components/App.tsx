
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
        message = "Configuration Error: API_KEY is missing. Check your deployment environment.";
      } else if (errorString.includes('429')) {
        message = "Pro Engine Quota (429): Gemini 2.5 Pro has a smaller rate limit on the free tier (2 requests/min). Please wait 30-60 seconds before trying again.";
      } else if (errorString.includes('404')) {
        message = "Model Not Available (404): Gemini 2.5 Pro might be restricted in your region or project tier. Check your Google AI Studio console.";
      } else if (errorString.includes('quota')) {
        message = "Daily Limit Reached: You have exhausted your Gemini 2.5 Pro daily quota.";
      } else {
        message = err.message || "Failed to generate content. Verify connection and API key.";
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
            <div className="bg-indigo-700 p-2 rounded-lg shadow-indigo-200 shadow-lg">
              <i className="fas fa-brain text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Awais <span className="text-indigo-700">Pro Architect</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full">
              Engine: 2.5 Pro Preview
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
            Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">Pro-Level</span> Reasoning
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Leveraging Gemini 2.5 Pro for linguistic depth and high-complexity SEO architectural patterns.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1 bg-white rounded-full border border-slate-200 shadow-sm">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connected to 2.5 Pro Engine</p>
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
              <i className="fas fa-exclamation-circle text-2xl text-red-500"></i>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Engine Throttling</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">{error}</p>
            </div>
            <button 
              onClick={() => setStatus(GenerationStatus.IDLE)} 
              className="px-8 py-3 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-black transition-all shadow-lg active:scale-95"
            >
              Wait & Retry
            </button>
          </div>
        )}

        <div id="result-area" className="mt-12">
          {status === GenerationStatus.LOADING && (
            <div className="flex flex-col items-center justify-center space-y-4 py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-700 rounded-full animate-spin"></div>
                <i className="fas fa-cog absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-700 animate-pulse"></i>
              </div>
              <div className="text-center">
                <p className="text-slate-800 font-bold text-lg tracking-tight">Reasoning with 2.5 Pro...</p>
                <p className="text-slate-500 text-xs italic">Crafting deep semantic structures. This may take a moment.</p>
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
