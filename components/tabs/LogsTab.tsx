
import React from 'react';
import { ScalingLog } from '../../App';
import { PredictionResult } from '../../types';

interface LogsTabProps {
  logs: ScalingLog[];
  prediction: PredictionResult | null;
}

const LogsTab: React.FC<LogsTabProps> = ({ logs, prediction }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-brand-brown">System Events</h2>
          <p className="text-brand-brown/50 text-sm">Low-level HPA controller and cluster audit logs.</p>
        </div>
        {logs.length > 0 && (
           <div className="px-4 py-2 bg-white border border-brand-brown/5 rounded-xl text-[10px] font-bold text-brand-rose uppercase tracking-widest soft-shadow">
             {logs.length} Operations logged
           </div>
        )}
      </div>

      <div className="bg-white rounded-[3rem] border border-brand-brown/5 soft-shadow overflow-hidden">
        <div className="p-6 bg-brand-softPink border-b border-brand-brown/5 flex justify-between items-center">
          <span className="text-[10px] font-black text-brand-brown/30 uppercase tracking-widest">Timestamp</span>
          <span className="text-[10px] font-black text-brand-brown/30 uppercase tracking-widest">Message Payload</span>
        </div>
        <div className="h-[500px] overflow-y-auto p-8 space-y-4 custom-scrollbar">
          {logs.length > 0 ? logs.map(log => (
            <div key={log.id} className="flex gap-8 group animate-fadeIn">
               <span className="text-[10px] font-mono text-brand-brown/40 group-hover:text-brand-rose transition-colors">{log.timestamp}</span>
               <div className="flex-1">
                 <div className={`text-xs leading-relaxed ${
                   log.type === 'scaling' ? 'text-brand-brown font-bold' : 
                   log.type === 'error' ? 'text-red-500' : 'text-brand-brown/60'
                 }`}>
                   {log.message}
                 </div>
                 {log.type === 'scaling' && (
                   <div className="mt-1 flex gap-2">
                     <span className="px-1.5 py-0.5 bg-brand-rose/10 text-brand-rose text-[8px] font-black rounded uppercase tracking-tighter">Scaling Event</span>
                     <span className="px-1.5 py-0.5 bg-brand-brown/5 text-brand-brown/30 text-[8px] font-black rounded uppercase tracking-tighter">Success</span>
                   </div>
                 )}
               </div>
            </div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
               <svg className="w-12 h-12 mb-4 text-brand-rose/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <p className="text-[10px] font-black uppercase tracking-widest text-brand-rose/60">No Events Streamed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsTab;