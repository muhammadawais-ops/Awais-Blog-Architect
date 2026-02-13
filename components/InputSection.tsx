
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
        <span className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">MUM/BERT Optimized</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Topic / Headline</label>
            <input
              type="text"
              name="topic"
              value={inputs.topic}
              onChange={handleChange}
              placeholder="The focus of your blog..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Primary Keyword</label>
            <input
              type="text"
              name="primaryKeyword"
              value={inputs.primaryKeyword}
              onChange={handleChange}
              placeholder="e.g. Luxury Interior Design"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Target Domain (Optional)</label>
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
            <label className="text-xs font-bold text-slate-700 uppercase">Word Count</label>
            <input
              type="number"
              name="wordCount"
              value={inputs.wordCount}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 uppercase">Expert Context (EEAT Parameters)</label>
            <button 
              onClick={loadTemplate}
              className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-tighter"
            >
              <i className="fas fa-plus mr-1"></i> Load Template
            </button>
          </div>
          <textarea
            name="businessDetails"
            value={inputs.businessDetails}
            onChange={handleChange}
            rows={10}
            placeholder="Paste your niche points here (Niche, Years of Experience, UVP, etc.)"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
          ></textarea>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !inputs.topic}
        className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-2xl transition-all ${
          isLoading ? 'bg-indigo-400 cursor-wait' : 'bg-slate-900 hover:bg-black active:scale-[0.98]'
        }`}
      >
        {isLoading ? 'Architecting Expert Content...' : 'Generate Pro Humanized Content'}
      </button>
    </div>
  );
};

export default InputSection;
