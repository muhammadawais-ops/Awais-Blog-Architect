
import React, { useState, useMemo } from 'react';
import { GeneratedBlog } from '../types';
import { marked } from 'marked';
import AnalysisDashboard from './AnalysisDashboard';

interface ResultSectionProps {
  blog: GeneratedBlog;
}

const ResultSection: React.FC<ResultSectionProps> = ({ blog }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const renderer = new marked.Renderer();
  
  const parsedHtml = useMemo(() => {
    const cleanContent = blog.content.replace(/^#\s*/, '# ');
    return marked.parse(cleanContent, { renderer });
  }, [blog.content]);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Metrics Dashboard */}
      <AnalysisDashboard metrics={blog.metrics} />

      {/* Meta Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 group relative transition-all hover:border-indigo-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">SEO Meta Title</span>
            <button 
              onClick={() => copyToClipboard(blog.metaTitle, 'title')}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <i className={`fas ${copiedSection === 'title' ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
            </button>
          </div>
          <p className="text-slate-900 font-bold leading-snug text-lg">{blog.metaTitle}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 group relative transition-all hover:border-purple-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wider">SEO Meta Description</span>
            <button 
              onClick={() => copyToClipboard(blog.metaDescription, 'desc')}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <i className={`fas ${copiedSection === 'desc' ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
            </button>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{blog.metaDescription}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
          <div className="flex flex-wrap gap-2">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded">EEAT VERIFIED</span>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">HUMAN-OPTIMIZED</span>
          </div>
          <button
            onClick={() => copyToClipboard(blog.content, 'content')}
            className="flex items-center space-x-2 text-sm text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg font-bold transition-all"
          >
            <i className={`fas ${copiedSection === 'content' ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
            <span>{copiedSection === 'content' ? 'Markdown Copied!' : 'Copy Formatted Text'}</span>
          </button>
        </div>

        <div className="p-8 md:p-16 lg:p-20 bg-white">
          <article 
            className="prose prose-slate max-w-none selection:bg-indigo-100"
            dangerouslySetInnerHTML={{ __html: parsedHtml as string }}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultSection;
