
import React from 'react';
import { BlogInputs } from '../types';

interface InputSectionProps {
  inputs: BlogInputs;
  setInputs: (inputs: BlogInputs) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ inputs, setInputs, onGenerate, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: name === 'wordCount' ? parseInt(value) || 0 : value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-8">
      <div className="flex items-center space-x-3 text-indigo-600 border-b border-slate-100 pb-4">
        <i className="fas fa-drafting-compass text-2xl"></i>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Project Parameters</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Main Topic / Working Title</label>
          <input
            type="text"
            name="topic"
            value={inputs.topic}
            onChange={handleChange}
            placeholder="e.g. Modern Architecture Trends 2025"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center">
              Primary Keyword 
              <span className="ml-2 text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded shadow-sm">Target</span>
            </label>
            <input
              type="text"
              name="primaryKeyword"
              value={inputs.primaryKeyword}
              onChange={handleChange}
              placeholder="The main search term"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Secondary Keywords</label>
            <input
              type="text"
              name="secondaryKeywords"
              value={inputs.secondaryKeywords}
              onChange={handleChange}
              placeholder="Keyword 1, Keyword 2, ..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Website Domain</label>
            <div className="relative">
              <i className="fas fa-globe absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="url"
                name="websiteUrl"
                value={inputs.websiteUrl}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Word Count Target</label>
            <input
              type="number"
              name="wordCount"
              value={inputs.wordCount}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            Expert Context
            <span className="text-[10px] text-slate-400 font-normal normal-case italic">(Tone, business info, specific details)</span>
          </label>
          <textarea
            name="businessDetails"
            value={inputs.businessDetails}
            onChange={handleChange}
            rows={4}
            placeholder="Tell the architect about your business or specific perspective to make it sound human..."
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none resize-none"
          ></textarea>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !inputs.topic || !inputs.primaryKeyword}
        className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-2xl transition-all flex items-center justify-center space-x-3 ${
          isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200 hover:-translate-y-1 active:scale-95'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Architecting Content...</span>
          </>
        ) : (
          <>
            <i className="fas fa-hammer"></i>
            <span>Build My Blog</span>
          </>
        )}
      </button>
      
      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        ZeroGPT & Hemingway Optimized Generation
      </p>
    </div>
  );
};

export default InputSection;
