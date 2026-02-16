
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
      console.error("Generation Error:", err);
      let message = "An unexpected error occurred.";
      
      if (err.message === "API_KEY_MISSING") {
        message = "Configuration Error: API_KEY is not set in environment variables.";
      } else if (err.status === 404 || err.message?.includes('404')) {
        message = "Model Not Found (404): The selected Gemini model is currently unavailable in your region or is being updated by Google. Please try again in a few minutes.";
      } else if (err.status === 429 || err.message?.includes('429')) {
        message = "Rate Limit Reached (429): Google's free tier allows 15 requests/min. Please wait 60 seconds.";
      } else {
        message = err.message || "Failed to generate content. Please check your API key and connection.";
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
            <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-lg">
              <i className="fas fa-layer-group text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Awais <span className="text-indigo-600">Blog Architect</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full">
              Stable Build v3.0
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
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connected to Gemini 3 Engine</p>
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
              <h3 className="text-lg font-bold text-slate-900">Oops! Something went wrong</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">{error}</p>
            </div>
            <button 
              onClick={() => setStatus(GenerationStatus.IDLE)} 
              className="px-6 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-black transition-all"
            >
              Dismiss & Try Again
            </button>
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
                <p className="text-slate-500 text-xs italic">Using Gemini 3 Flash for maximum speed and accuracy.</p>
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
