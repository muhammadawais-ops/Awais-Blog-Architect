
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
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black text-2xl">{value}%</span>
        </div>
      </div>
      <span className="mt-3 text-[10px] uppercase font-bold tracking-widest text-slate-400">{label}</span>
      <span className="text-[9px] text-slate-500 font-medium">{subtext}</span>
    </div>
  );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ metrics }) => {
  const getGradeColor = (grade: number) => {
    if (grade <= 8) return '#10b981'; // Perfect Zone (Green)
    if (grade <= 10) return '#f59e0b'; // Medium Zone (Yellow)
    return '#ef4444'; // Hard Zone (Red)
  };

  const getReadabilityText = (grade: number) => {
    if (grade <= 8) return "Perfectly Simple";
    if (grade <= 10) return "Needs Simplification";
    return "Too Academic";
  };

  return (
    <div className="bg-slate-900 text-white rounded-[2rem] p-10 shadow-2xl mb-12 border border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <i className="fas fa-microchip text-8xl text-indigo-400"></i>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-center gap-16">
          {/* ZeroGPT Assessment */}
          <ScoreGauge 
            value={metrics.aiScore} 
            label="Human Confidence" 
            subtext={metrics.aiScore > 90 ? "ZeroGPT: Safe" : "ZeroGPT: Warning"}
            color={metrics.aiScore > 90 ? "#6366f1" : "#f43f5e"} 
          />

          <div className="h-20 w-px bg-slate-800 hidden sm:block"></div>

          {/* Hemingway Assessment */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black" style={{ color: getGradeColor(metrics.readabilityGrade) }}>
                {metrics.readabilityGrade}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2">Hemingway Grade</span>
            <span className="text-[9px] text-slate-500 font-medium" style={{ color: getGradeColor(metrics.readabilityGrade) }}>
              {getReadabilityText(metrics.readabilityGrade)}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md bg-slate-800/30 p-6 rounded-2xl border border-slate-800/50">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Linguistic Integrity</h4>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">AEO/MUM Verified</span>
          </div>
          
          <div className="space-y-5">
            {[
              { label: 'Passive Voice', value: metrics.passiveVoice, max: 5, color: 'bg-indigo-500' },
              { label: 'Adverbs', value: metrics.adverbs, max: 10, color: 'bg-purple-500' },
              { label: 'Hard Sentences', value: metrics.hardSentences, max: 8, color: 'bg-yellow-500' },
              { label: 'Critical Errors', value: metrics.veryHardSentences, max: 3, color: 'bg-red-500' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">{stat.label}</span>
                  <span className={stat.value > stat.max ? 'text-red-400' : 'text-slate-300'}>
                    {stat.value} / {stat.max}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stat.color} transition-all duration-1000 ease-in-out`} 
                    style={{ width: `${Math.min(100, (stat.value / (stat.max * 1.5)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/50 pt-6">
        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> PAS FRAMEWORK
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> BRAND VOICE ALIGNED
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> ZERO-GPT BYPASS
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> BERT/MUM ENTITY
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
