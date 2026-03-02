
import React from 'react';
import { BlogInputs } from '../types';

interface InputSectionProps {
  inputs: BlogInputs;
  setInputs: (inputs: BlogInputs) => void;
  onGenerate: () => void;
  isLoading: boolean;
  fastMode: boolean;
  setFastMode: (fastMode: boolean) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ inputs, setInputs, onGenerate, isLoading, fastMode, setFastMode }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: name === 'wordCount' ? parseInt(value) || 0 : value });
  };

  const loadTemplate = () => {
    const template = `- Client Niche: 
- Years of Experience: 
- Business Goals: 
- Target Audience: 
- Audience Stage: (Cold/Warm)
- Neurological Triggers: (Scarcity/Social Proof/Authority)
- Brand Tone: (Professional/Luxury/Friendly)
- UVP: 
- Services Highlighted: 
- CTA Style: (Soft/Direct)
- Competitor Edge: `;
    setInputs({ ...inputs, businessDetails: template });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3 text-indigo-600">
          <i className="fas fa-microchip text-2xl"></i>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Architectural Inputs</h2>
        </div>
        <div className="flex gap-2">
            <span className="text-[9px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">Readability: Grade 0-9</span>
            <span className="text-[9px] bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">Max AI: 30%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Primary Topic / Headline</label>
            <input
              type="text"
              name="topic"
              value={inputs.topic}
              onChange={handleChange}
              placeholder="Initialization Topic"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Primary Keyword (NLP Focus)</label>
            <input
              type="text"
              name="primaryKeyword"
              value={inputs.primaryKeyword}
              onChange={handleChange}
              placeholder="Primary Keyword"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Secondary Keywords (NLP Standards)</label>
            <input
              type="text"
              name="secondaryKeywords"
              value={inputs.secondaryKeywords}
              onChange={handleChange}
              placeholder="keyword1, keyword2, keyword3..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Word Count Target</label>
            <input
              type="number"
              name="wordCount"
              value={inputs.wordCount}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Target Domain (for CTA Link)</label>
            <input
              type="url"
              name="websiteUrl"
              value={inputs.websiteUrl}
              onChange={handleChange}
              placeholder="https://yourbrand.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Senior Specialist EEAT Context</label>
            <button 
              onClick={loadTemplate}
              className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-tighter float-right"
            >
              <i className="fas fa-plus mr-1"></i> Load Template
            </button>
            <textarea
              name="businessDetails"
              value={inputs.businessDetails}
              onChange={handleChange}
              rows={4}
              placeholder="Anecdotal insights, niche expertise, brand tone..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-mono text-xs"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center h-5">
            <input
              id="fast-mode"
              name="fast-mode"
              type="checkbox"
              checked={fastMode}
              onChange={(e) => setFastMode(e.target.checked)}
              className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-slate-300 rounded cursor-pointer transition-all"
            />
          </div>
          <div className="ml-1 text-sm">
            <label htmlFor="fast-mode" className="font-black text-slate-700 cursor-pointer uppercase tracking-tight">Fast Mode (No Research)</label>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Skips live web research for 2x faster generation.</p>
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading || !inputs.topic}
          className={`px-10 py-5 rounded-2xl font-black text-lg text-white shadow-2xl transition-all flex items-center gap-3 ${
            isLoading ? 'bg-indigo-400 cursor-wait' : 'bg-slate-900 hover:bg-black active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Architecting...
            </>
          ) : (
            <>
              <i className="fas fa-magic"></i>
              Generate Pro Content
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;
