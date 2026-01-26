
import React, { useState } from 'react';
import { Pod, PodStatus } from '../types';

interface PodGridProps {
  pods: Array<Pod>;
}

const PodGrid: React.FC<PodGridProps> = ({ pods }) => {
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);

  const getStatusStyle = (status: PodStatus) => {
    switch (status) {
      case PodStatus.RUNNING: return 'bg-brand-rose/10 text-brand-rose border-brand-rose/20';
      case PodStatus.PENDING: return 'bg-brand-accent/10 text-brand-accent border-brand-accent/20';
      case PodStatus.TERMINATING: return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-brand-softPink text-brand-brown/20 border-brand-brown/5';
    }
  };

  const closeModal = () => setSelectedPod(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {pods.map((pod) => (
          <button 
            key={pod.id}
            onClick={() => setSelectedPod(pod)}
            className="group bg-white border border-brand-brown/5 rounded-3xl p-6 transition-all hover:bg-brand-softPink hover:-translate-y-1 hover:shadow-xl flex flex-col items-center text-center relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${pod.status === PodStatus.RUNNING ? 'bg-brand-rose animate-pulse' : 'bg-brand-accent'}`}></div>
            </div>

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border-2 ${getStatusStyle(pod.status)}`}>
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
            </div>
            
            <p className="text-[9px] font-black tracking-widest text-brand-brown/20 uppercase mb-1">NODE: {pod.id.split('-')[1] || 'LOCAL'}</p>
            <p className="text-xs font-bold text-brand-brown truncate w-full mb-4">{pod.name}</p>
            
            <div className="w-full space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[8px] font-bold text-brand-brown/30 uppercase tracking-tighter">CPU Load</span>
                  <span className="text-[8px] font-black text-brand-rose">{pod.cpu.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-brand-softPink h-2 rounded-full overflow-hidden border border-brand-brown/5">
                  <div 
                    className="bg-brand-rose h-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min(100, pod.cpu)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-brand-softPink rounded-xl py-2 px-3 flex flex-col items-center border border-brand-brown/5">
                <span className="text-[8px] font-bold text-brand-brown/30 uppercase tracking-tighter mb-0.5">Memory Usage</span>
                <span className="text-[11px] font-black text-brand-brown font-mono">{pod.memory.toFixed(0)} MB</span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-rose opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        ))}
        
        {pods.length === 0 && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-brand-softPink border border-dashed border-brand-brown/10 h-56 rounded-3xl flex items-center justify-center text-brand-rose/40">
             <span className="text-[10px] font-bold tracking-widest uppercase">Provisioning...</span>
          </div>
        ))}
      </div>

      {selectedPod && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-brand-brown/5 backdrop-blur-md animate-fadeIn" 
            onClick={closeModal}
          ></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-brown/5 animate-zoomIn">
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selectedPod.status === PodStatus.RUNNING ? 'bg-brand-rose' : 'bg-brand-accent'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-rose/60">Pod Inspector</span>
                  </div>
                  <h2 className="text-2xl font-bold text-brand-brown">{selectedPod.name}</h2>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-brand-brown/5 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-brand-brown/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-softPink p-6 rounded-3xl border border-brand-brown/5">
                  <p className="text-[10px] font-bold text-brand-brown/30 uppercase tracking-widest mb-1">Status</p>
                  <p className={`text-lg font-black ${selectedPod.status === PodStatus.RUNNING ? 'text-brand-rose' : 'text-brand-accent'}`}>
                    {selectedPod.status}
                  </p>
                </div>
                <div className="bg-brand-softPink p-6 rounded-3xl border border-brand-brown/5">
                  <p className="text-[10px] font-bold text-brand-brown/30 uppercase tracking-widest mb-1">Node ID</p>
                  <p className="text-lg font-black text-brand-brown font-mono">
                    {selectedPod.id.split('-')[1]?.toUpperCase() || 'PRIMARY'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-brand-brown/40">CPU Usage</span>
                    <span className="text-sm font-black text-brand-rose">{selectedPod.cpu.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-brand-softPink h-3 rounded-full overflow-hidden border border-brand-brown/5">
                    <div 
                      className="bg-brand-rose h-full transition-all duration-1000" 
                      style={{ width: `${selectedPod.cpu}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-brand-brown/40">Memory Resident Set Size</span>
                    <span className="text-sm font-black text-brand-brown">{selectedPod.memory.toFixed(1)} MB</span>
                  </div>
                  <div className="w-full bg-brand-softPink h-3 rounded-full overflow-hidden border border-brand-brown/5">
                    <div 
                      className="bg-brand-accent h-full transition-all duration-1000" 
                      style={{ width: `${(selectedPod.memory / 512) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-brown/5 flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-brand-brown/20 uppercase tracking-widest">Initialization Time</p>
                  <p className="text-xs font-medium text-brand-brown/40">
                    {new Date(selectedPod.startTime).toLocaleString()}
                  </p>
                </div>
                <div className="px-4 py-2 bg-brand-softPink rounded-full text-[10px] font-bold text-brand-brown/30 uppercase tracking-widest border border-brand-brown/5">
                  ID: {selectedPod.id}
                </div>
              </div>
            </div>
            
            <div className="bg-brand-softPink p-6 flex justify-end gap-4 border-t border-brand-brown/5">
              <button 
                onClick={closeModal}
                className="px-8 py-3 bg-brand-rose text-white rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-rose/10"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </>
  );
};

export default PodGrid;