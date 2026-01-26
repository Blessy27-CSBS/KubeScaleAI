
import React from 'react';
import { PredictionResult } from '../types';

interface DashboardProps {
  prediction: PredictionResult;
}

const Dashboard: React.FC<DashboardProps> = ({ prediction }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Estimated Users</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold text-white">{prediction.estimatedUsers.toLocaleString()}</h2>
          <span className="text-green-400 text-xs font-medium">Live</span>
        </div>
        <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full" 
            style={{ width: `${Math.min(100, (prediction.estimatedUsers / 5000) * 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Target Pods</p>
        <h2 className="text-3xl font-bold text-blue-400">{prediction.recommendedPods}</h2>
        <p className="text-slate-500 text-xs mt-1">HPA Recommendation</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Confidence</p>
        <h2 className="text-3xl font-bold text-purple-400">{(prediction.confidence * 100).toFixed(0)}%</h2>
        <p className="text-slate-500 text-xs mt-1">Prediction Precision</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Grounding Sources</p>
          <div className="flex flex-wrap gap-1">
            {prediction.sources.slice(0, 3).map((s, i) => (
              <a 
                key={i} 
                href={s.uri} 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 hover:bg-slate-700 text-blue-300 truncate max-w-[100px]"
                title={s.title}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="md:col-span-2 lg:col-span-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
        <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           AI Analysis Summary
        </h4>
        <p className="text-slate-300 leading-relaxed text-sm italic">
          "{prediction.explanation}"
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
