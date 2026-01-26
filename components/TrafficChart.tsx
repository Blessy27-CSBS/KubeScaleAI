
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrafficData } from '../types';

interface TrafficChartProps {
  data: TrafficData[];
}

const TrafficChart: React.FC<TrafficChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPods" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34D399" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            stroke="#94A3B8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            yAxisId="left"
            stroke="#94A3B8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#34D399" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#F1F5F9', borderRadius: '12px', color: '#0F172A', border: '1px solid #F1F5F9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#0F172A' }} />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="users" 
            name="Concurrent Users"
            stroke="#10B981" 
            fillOpacity={1} 
            fill="url(#colorUsers)" 
            strokeWidth={3}
          />
          <Area 
            yAxisId="right"
            type="stepAfter" 
            dataKey="pods" 
            name="Active Pods"
            stroke="#34D399" 
            fillOpacity={1} 
            fill="url(#colorPods)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficChart;