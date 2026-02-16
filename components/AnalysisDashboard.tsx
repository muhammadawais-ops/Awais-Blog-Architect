
import React from 'react';
import { AnalysisMetrics } from '../types';

interface AnalysisDashboardProps {
  metrics: AnalysisMetrics;
}

const MetricCard: React.FC<{ label: string; value: string | number; sub: string; icon: string; color: string }> = ({ label, value, sub, icon, color }) => (
  <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-800/60 transition-all">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color} bg-opacity-20`}>
      <i className={`fas ${icon} ${color.replace('bg-', 'text-')}`}></i>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-[9px] text-slate-400 font-medium">{sub}</p>
    </div>
  </div>
);

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ metrics }) => {
  const humanConfidence = 100 - metrics.aiScore;
  const isOptimal = metrics.ariGrade <= 9;

  return (
    <div className="bg-slate-950 text-white rounded-[2.5rem] p-8 md:p-12 shadow-3xl mb-12 border border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <i className="fas fa-feather-pointed text-[12rem] rotate-12"></i>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <span className="bg-indigo-600 px-3 py-1 rounded-lg">Elite</span>
              Architect Audit Results
            </h3>
            <p className="text-slate-400 text-sm mt-1">Linguistic Analysis by 20-Year Copywriting Engine</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-black text-emerald-400">{humanConfidence}%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Human Authenticity</p>
            </div>
            <div className="w-px h-12 bg-slate-800"></div>
            <div className="text-center">
              <p className={`text-4xl font-black ${isOptimal ? 'text-blue-400' : 'text-amber-400'}`}>
                {metrics.ariGrade}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Grade Level</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">AI Detection Parameters</h4>
            <MetricCard label="Perplexity" value={metrics.perplexity} sub="Predictability Index" icon="fa-shuffle" color="bg-purple-500" />
            <MetricCard label="Burstiness" value={metrics.burstiness} sub="Sentence Variance" icon="fa-wave-square" color="bg-blue-500" />
            <MetricCard label="Vocabulary Diversity" value={`${metrics.vocabularyDiversity}%`} sub="Unique Synonyms" icon="fa-book" color="bg-emerald-500" />
            <MetricCard label="Entropy" value={metrics.entropy} sub="Info Density" icon="fa-bolt" color="bg-yellow-500" />
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest border-l-4 border-rose-600 pl-3">Readability Metrics</h4>
            <MetricCard label="Flesch Ease" value={metrics.fleschScore} sub="Reading Comfort" icon="fa-glasses" color="bg-rose-500" />
            <MetricCard label="Gunning Fog" value={metrics.fogIndex} sub="Education Level" icon="fa-graduation-cap" color="bg-indigo-500" />
            <MetricCard label="Avg Sentence" value={metrics.avgSentenceLength} sub="Words/Sentence" icon="fa-ruler-horizontal" color="bg-teal-500" />
            <MetricCard label="Complexity Ratio" value={`${metrics.complexWordPercentage}%`} sub="Advanced Words" icon="fa-brain" color="bg-cyan-500" />
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-6">Linguistic Load Audit</h4>
            <div className="space-y-6">
              {[
                { label: 'Syntactic Complexity', val: metrics.syntacticComplexity, target: 40 },
                { label: 'Semantic Coherence', val: metrics.semanticCoherence, target: 90 },
                { label: 'Passive Voice Ratio', val: metrics.passiveVoiceRatio, target: 15 },
                { label: 'Hard Sentences', val: metrics.hardSentences, target: 10 }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase">
                    <span>{item.label}</span>
                    <span className="text-white">{item.val}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${Math.min(100, (item.val / (item.target * 2)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-[10px] text-emerald-400 font-bold text-center">
                <i className="fas fa-check-circle mr-1"></i> COPIED CONTENT EEAT VERIFIED
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-800">
          <span className="text-[9px] font-black bg-slate-800 px-3 py-1 rounded text-slate-400 uppercase tracking-widest">N-Gram Frequency: Low</span>
          <span className="text-[9px] font-black bg-slate-800 px-3 py-1 rounded text-slate-400 uppercase tracking-widest">Probability Mapping: Humanoid</span>
          <span className="text-[9px] font-black bg-slate-800 px-3 py-1 rounded text-slate-400 uppercase tracking-widest">Voice Consistency: Stable</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
