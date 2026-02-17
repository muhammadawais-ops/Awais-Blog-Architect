
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
  
  // Using 'any' for the parameter to bypass TypeScript build errors regarding the signature
  // which can vary between different versions of marked during the build process.
  renderer.link = (tokenOrHref: any) => {
    let href = '';
    let title = '';
    let text = '';

    if (typeof tokenOrHref === 'string') {
      // Positional arguments (Older marked versions)
      href = tokenOrHref;
      // In positional, title and text would be the 2nd and 3rd arguments
    } else {
      // Token object (Modern marked versions)
      href = tokenOrHref.href || '';
      title = tokenOrHref.title || '';
      text = tokenOrHref.text || '';
    }

    return `<a href="${href}" title="${title}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 font-bold underline hover:text-indigo-800 transition-colors">${text}</a>`;
  };

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

      {/* Sources Section (If any) */}
      {blog.sources && blog.sources.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-search-nodes text-indigo-600"></i>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Authoritative Sources Cited</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {blog.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
              >
                <i className="fas fa-link text-[10px] opacity-50"></i>
                {source.title.length > 40 ? source.title.substring(0, 40) + '...' : source.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
          <div className="flex flex-wrap gap-2">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded">EEAT VERIFIED</span>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">HUMAN-OPTIMIZED</span>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded">RESEARCH-BACKED</span>
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
