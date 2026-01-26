
import React from 'react';
import { TrafficData, PredictionResult } from '../../types';
import TrafficChart from '../TrafficChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MetricsTabProps {
  trafficHistory: TrafficData[];
  prediction: PredictionResult | null;
}

const MetricsTab: React.FC<MetricsTabProps> = ({ trafficHistory, prediction }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-3xl font-black text-brand-brown">Predictive Convergence</h2>
        <p className="text-brand-brown/50 text-sm">Synchronizing Nova AI forecasts with live cluster telemetry.</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Traffic & Pod Scaling Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-brand-brown/5 soft-shadow h-[500px]">
          <h3 className="text-sm font-black text-brand-brown/30 uppercase tracking-widest mb-6">User Load vs. Active Replicas</h3>
          {trafficHistory.length > 0 ? (
            <TrafficChart data={trafficHistory} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <svg className="w-16 h-16 mb-4 text-brand-rose/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-rose/60">Awaiting Nova Pulse Stream</p>
            </div>
          )}
        </div>

        {/* Resource Utilization Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-brand-brown/5 soft-shadow h-[500px]">
          <h3 className="text-sm font-black text-brand-brown/30 uppercase tracking-widest mb-6">Resource Allocation (Nova Optimization)</h3>
          {trafficHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#F1F5F9', borderRadius: '16px', border: '1px solid #F1F5F9', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  name="Avg CPU (%)" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  name="Avg Memory (MB)" 
                  stroke="#34D399" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <svg className="w-16 h-16 mb-4 text-brand-rose/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-rose/60">Awaiting Telemetry</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-rose text-white p-8 rounded-[2rem] shadow-lg shadow-brand-rose/10">
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">Max Capacity Forecast</p>
          <p className="text-2xl font-black">{prediction ? prediction.estimatedUsers.toLocaleString() : '---'}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-brand-brown/5 soft-shadow">
          <p className="text-[10px] font-bold text-brand-brown/30 uppercase tracking-widest mb-2">Replica Sync Lag</p>
          <p className="text-2xl font-black text-brand-brown">0.42s Avg</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-brand-brown/5 soft-shadow">
          <p className="text-[10px] font-bold text-brand-brown/30 uppercase tracking-widest mb-2">Stability Matrix</p>
          <p className="text-2xl font-black text-brand-rose">OPTIMAL</p>
        </div>
      </div>
    </div>
  );
};

export default MetricsTab;
