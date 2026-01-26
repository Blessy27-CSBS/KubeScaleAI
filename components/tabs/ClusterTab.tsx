
import React from 'react';
import { Pod, PredictionResult } from '../../types';
import PodGrid from '../PodGrid';

interface ClusterTabProps {
  pods: Pod[];
  prediction: PredictionResult | null;
}

const ClusterTab: React.FC<ClusterTabProps> = ({ pods, prediction }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-brand-brown">Cluster Infrastructure</h2>
          <p className="text-brand-brown/50 text-sm">Real-time visualization of containerized resources and scaling lifecycle.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-brand-brown/5 soft-shadow flex items-center gap-3">
             <div className="w-2 h-2 bg-brand-rose rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold text-brand-rose uppercase tracking-widest">Target: {prediction?.recommendedPods || 0} Replicas</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-brand-brown/5 soft-shadow">
        <PodGrid pods={pods} />
      </div>

      {!prediction && (
        <div className="py-20 text-center opacity-20">
          <p className="text-xs font-black uppercase tracking-widest text-brand-rose">Prediction Required to Enable Scaling</p>
        </div>
      )}
    </div>
  );
};

export default ClusterTab;