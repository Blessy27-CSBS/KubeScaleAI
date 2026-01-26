
import React, { useState, useMemo } from 'react';
import { Pod, PodStatus, TrafficData, PredictionResult } from '../types';
import { ScalingLog } from '../App';
import PodGrid from './PodGrid';
import TrafficChart from './TrafficChart';
import ChatInterface from './ChatInterface';

interface DashboardViewProps {
  url: string;
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  prediction: PredictionResult | null;
  pods: Pod[];
  trafficHistory: TrafficData[];
  logs: ScalingLog[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ url, onAnalyze, isAnalyzing, prediction, pods, trafficHistory, logs }) => {
  const [inputUrl, setInputUrl] = useState(url);
  const [error, setError] = useState<string | null>(null);

  const runningPods = useMemo(() => pods.filter(p => p.status === PodStatus.RUNNING), [pods]);
  const pendingPods = useMemo(() => pods.filter(p => p.status === PodStatus.PENDING), [pods]);

  const validateUrl = (str: string) => {
    try {
      const urlToTest = str.startsWith('http') ? str : `https://${str}`;
      new URL(urlToTest);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleAnalyzeClick = () => {
    setError(null);
    const trimmedUrl = inputUrl.trim();
    
    if (!trimmedUrl) {
      setError("Enter a target URL.");
      return;
    }

    if (!validateUrl(trimmedUrl)) {
      setError("Valid URL required (e.g., example.com).");
      return;
    }

    const finalUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
    onAnalyze(finalUrl);
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-10 space-y-12">
      {/* Hero Section */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-block px-4 py-1.5 border border-dashed border-brand-yellow text-brand-yellow rounded-lg text-xs font-bold bg-white dark:bg-slate-900">
            HPA Controller Online
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-brand-dark dark:text-white">
            Predictive Scaling <br />
            <span className="text-brand-yellow italic underline decoration-brand-yellow/30">Powered by Gemini.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg">
            Real-time analysis of live web popularity via Google Search to proactively scale your cluster.
          </p>
          
          <div className="space-y-2 pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeClick()}
                  placeholder="Analyze popularity of URL..."
                  className={`w-full px-6 py-4 rounded-full bg-slate-50 dark:bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-all`}
                />
              </div>
              <button 
                onClick={handleAnalyzeClick}
                disabled={isAnalyzing}
                className="px-8 py-4 bg-brand-dark text-white rounded-full font-bold shadow-xl shadow-brand-dark/20 hover:scale-105 transition-transform flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                {isAnalyzing ? "Analyzing..." : "Scale Cluster"}
                {!isAnalyzing && (
                  <div className="w-5 h-5 bg-brand-yellow rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
            {error && <p className="text-xs font-bold text-red-500 ml-6">{error}</p>}
          </div>
        </div>

        {/* Real-time Status Panel */}
        <div className="lg:w-1/2 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow rounded-full blur-[120px] opacity-10"></div>
          <div className="relative bg-white dark:bg-slate-900 p-8 rounded-[3rem] designer-shadow border border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Active Traffic</p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-black text-brand-dark dark:text-white">
                    {prediction ? prediction.estimatedUsers.toLocaleString() : '0'}
                  </p>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Target Replicas</p>
                <p className="text-4xl font-black text-brand-yellow">
                  {prediction ? prediction.recommendedPods : '0'}
                </p>
              </div>
              
              <div className="col-span-2 pt-2">
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 flex justify-between items-center border border-slate-200/50 dark:border-slate-700">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">HPA State</span>
                      <span className="text-xs font-bold text-brand-dark dark:text-white">
                        {runningPods.length === (prediction?.recommendedPods || 0) ? 'CLUSTER HEALTHY' : 'RECONCILING...'}
                      </span>
                   </div>
                   <div className="flex gap-4">
                      <div className="text-center">
                         <p className="text-xs font-black text-green-500">{runningPods.length}</p>
                         <p className="text-[8px] text-slate-400 font-bold uppercase">Ready</p>
                      </div>
                      <div className="text-center">
                         <p className="text-xs font-black text-brand-yellow">{pendingPods.length}</p>
                         <p className="text-[8px] text-slate-400 font-bold uppercase">Pending</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      {prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fadeIn">
          <div className="lg:col-span-3 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Analysis Summary */}
               <div className="bg-brand-dark text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      AI Insight
                    </h3>
                    <p className="text-slate-300 text-sm italic leading-relaxed">
                      "{prediction.explanation}"
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                    {prediction.sources.slice(0, 3).map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="text-[9px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-brand-yellow truncate max-w-[120px]">
                        {s.title}
                      </a>
                    ))}
                  </div>
               </div>

               {/* Live Logs */}
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 designer-shadow">
                  <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Cluster Events
                  </h3>
                  <div className="h-40 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                     {logs.map(log => (
                       <div key={log.id} className="flex gap-3 text-[10px] leading-tight border-b border-slate-50 dark:border-slate-800 pb-2">
                          <span className="text-slate-400 font-mono whitespace-nowrap">{log.timestamp}</span>
                          <span className={`${log.type === 'scaling' ? 'text-brand-yellow font-bold' : log.type === 'error' ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                            {log.message}
                          </span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Visualizer Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 designer-shadow">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-brand-dark dark:text-white">Metric Convergence</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">Telepresence Enabled</span>
               </div>
               <TrafficChart data={trafficHistory} />
            </div>

            {/* Resource Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 designer-shadow">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-brand-dark dark:text-white">Infrastructure State</h3>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  </div>
               </div>
               <PodGrid pods={pods} />
            </div>
          </div>

          <div className="lg:col-span-1">
             <ChatInterface prediction={prediction} />
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </main>
  );
};

export default DashboardView;
