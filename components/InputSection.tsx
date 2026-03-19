
import React, { useState } from 'react';
import { BlogInputs } from '../types';
import { generateSemanticVariations } from '../services/geminiService';

interface InputSectionProps {
  inputs: BlogInputs;
  setInputs: (inputs: BlogInputs) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ inputs, setInputs, onGenerate, isLoading }) => {
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: name === 'wordCount' ? parseInt(value) || 0 : value });
  };

  const handleGenerateVariations = async () => {
    if (!inputs.primaryKeyword) return;
    setIsGeneratingVariations(true);
    try {
      const variations = await generateSemanticVariations(inputs.primaryKeyword);
      const currentSecondary = inputs.secondaryKeywords ? inputs.secondaryKeywords.split(',').map(s => s.trim()) : [];
      const updatedSecondary = Array.from(new Set([...currentSecondary, ...variations])).join(', ');
      setInputs({ ...inputs, secondaryKeywords: updatedSecondary });
    } catch (error) {
      console.error("Error generating variations:", error);
    } finally {
      setIsGeneratingVariations(false);
    }
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
        {/* Content Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase">Content Architecture Type</label>
          <select
            name="contentType"
            value={inputs.contentType}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
          >
            <option value="blog">On-Page Blog Post (Google Policy Compliant)</option>
            <option value="guest_post">Expert Guest Post (Backlink Optimized)</option>
          </select>
        </div>

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
            <label className="text-xs font-bold text-slate-700 uppercase flex justify-between">
              Primary Keyword (NLP Focus)
              {inputs.primaryKeyword && (
                <button 
                  onClick={handleGenerateVariations}
                  disabled={isGeneratingVariations}
                  className="text-[10px] text-indigo-600 hover:underline lowercase font-black"
                >
                  {isGeneratingVariations ? 'Generating...' : '+ Get Semantic Variations'}
                </button>
              )}
            </label>
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
            <label className="text-xs font-bold text-slate-700 uppercase">Target Domain (Natural Integration)</label>
            <input
              type="url"
              name="websiteUrl"
              value={inputs.websiteUrl}
              onChange={handleChange}
              placeholder="https://yourbrand.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-500 font-medium">This domain will be naturally woven into the content as an expert reference.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Brand Name / Author Name</label>
            <input
              type="text"
              name="brandName"
              value={inputs.brandName}
              onChange={handleChange}
              placeholder="e.g. Awais Blog Architect"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-500 font-medium">Used for soft brand mentions and author bio.</p>
          </div>
        </div>

        {/* Guest Post Specific Fields */}
        {inputs.contentType === 'guest_post' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-700 uppercase">Backlink URL (Goal)</label>
              <input
                type="url"
                name="backlinkUrl"
                value={inputs.backlinkUrl}
                onChange={handleChange}
                placeholder="https://client-site.com/target-page"
                className="w-full px-4 py-3 rounded-xl border-2 border-white focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-700 uppercase">Anchor Text</label>
              <input
                type="text"
                name="anchorText"
                value={inputs.anchorText}
                onChange={handleChange}
                placeholder="e.g. expert SEO services"
                className="w-full px-4 py-3 rounded-xl border-2 border-white focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-700 uppercase">Host Website Niche/Context</label>
              <input
                type="text"
                name="targetSiteContext"
                value={inputs.targetSiteContext}
                onChange={handleChange}
                placeholder="e.g. Tech Blog, Marketing News"
                className="w-full px-4 py-3 rounded-xl border-2 border-white focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>
            <p className="md:col-span-3 text-[10px] text-indigo-600 font-bold italic">
              * Guest Post mode focuses on educational, non-salesy content with a natural author bio backlink.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
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

      <button
        onClick={onGenerate}
        disabled={isLoading || !inputs.topic}
        className={`w-full py-5 rounded-2xl font-black text-lg text-white shadow-2xl transition-all ${
          isLoading ? 'bg-indigo-400 cursor-wait' : 'bg-slate-900 hover:bg-black active:scale-[0.98]'
        }`}
      >
        {isLoading ? 'Architecting Senior SEO Content...' : `Generate Pro ${inputs.contentType === 'guest_post' ? 'Guest Post' : 'Blog Post'}`}
      </button>
    </div>
  );
};

export default InputSection;
