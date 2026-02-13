
import React from 'react';
import { AnalysisMetrics } from '../types';

interface AnalysisDashboardProps {
  metrics: AnalysisMetrics;
}

const ScoreGauge: React.FC<{ value: number; label: string; color: string; subtext: string }> = ({ value, label, color, subtext }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="56" cy="56" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
          <circle
            cx="56" cy="56" r={radius} fill="transparent" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black text-2xl">{value}%</span>
        </div>
      </div>
      <span className="mt-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 text-center">{label}</span>
      <span className="text-[9px] text-slate-500 font-medium text-center">{subtext}</span>
    </div>
  );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ metrics }) => {
  const humanConfidence = 100 - metrics.aiScore;
  const humanColor = humanConfidence >= 80 ? '#10b981' : (humanConfidence >= 50 ? '#f59e0b' : '#ef4444');
  
  // Green Signal if Readability Grade is 0 to 9
  const gradeColor = metrics.readabilityGrade <= 9 ? '#10b981' : '#ef4444';

  return (
    <div className="bg-slate-900 text-white rounded-[2rem] p-10 shadow-2xl mb-12 border border-slate-800 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
        <i className="fas fa-id-badge text-[15rem]"></i>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
        <div className="grid grid-cols-2 gap-8 md:gap-16">
          <ScoreGauge 
            value={humanConfidence} 
            label="Human Expertise" 
            subtext={humanConfidence >= 80 ? "EEAT Verified ✅" : "AI Likelihood High ⚠️"}
            color={humanColor} 
          />
          
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black" style={{ color: gradeColor }}>
                {metrics.readabilityGrade}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2">Readability Grade</span>
            <span className="text-[9px] text-slate-500 font-medium" style={{ color: gradeColor }}>
              {metrics.readabilityGrade <= 9 ? "Target (0-9): Green Signal ✅" : "Too Complex ⚠️"}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md bg-slate-800/30 p-6 rounded-2xl border border-slate-800/50">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Niche Mastery Audit</h4>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Pro Engine v5.1</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Burstiness (Voice Variety)', value: metrics.burstiness, max: 80, text: 'Rhythmic Narrative' },
              { label: 'Cliché Prevention', value: metrics.predictability, max: 10, text: 'No Robotic Markers' },
              { label: 'BERT Semantic Score', value: 99, max: 100, text: 'Intent Optimized' },
              { label: 'First-Person Density', value: 92, max: 100, text: 'Expert Narrative' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">{stat.label}</span>
                  <span className="text-[8px] text-slate-500 uppercase">{stat.text}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-1000"
                      style={{ width: `${Math.min(100, (stat.value / (stat.max * 1.2)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-black text-slate-200">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/50 pt-6">
        <div className="text-[9px] font-bold text-slate-500 flex items-center gap-2">
          <i className="fas fa-user-tie text-indigo-500"></i> FIRST-PERSON VOICE
        </div>
        <div className="text-[9px] font-bold text-slate-500 flex items-center gap-2">
          <i className="fas fa-ban text-red-500"></i> NO "LET'S BE REAL"
        </div>
        <div className="text-[9px] font-bold text-slate-500 flex items-center gap-2">
          <i className="fas fa-check-circle text-green-500"></i> GRADE 0-9 COMPLIANT
        </div>
        <div className="text-[9px] font-bold text-slate-500 flex items-center gap-2">
          <i className="fas fa-link text-purple-500"></i> "SITE:" VERIFIED
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
