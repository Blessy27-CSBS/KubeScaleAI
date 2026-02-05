import React, { useState, useEffect } from 'react';
import { Application } from '../../../server/src/models/app';

export const ScalingInsights: React.FC = () => {
    // Mock Data for Visualization (Connect to /api/metrics later)
    const [mockHistory, setMockHistory] = useState([
        { time: '10:00', traffic: 120, replicas: 2, reason: 'Baseline traffic' },
        { time: '10:05', traffic: 450, replicas: 5, reason: 'AI Predicted Spike (Confidence: 92%)' },
        { time: '10:10', traffic: 480, replicas: 5, reason: 'Holding capacity for peak' },
        { time: '10:15', traffic: 150, replicas: 2, reason: 'Traffic stabilized, scaling down' },
    ]);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-serif text-gray-800 mb-2">Scaling Insights</h1>
            <p className="text-gray-500 mb-8">AI-driven decisions for your applications.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-700 mb-6">Traffic vs Replicas (Last Hour)</h2>

                    {/* Simplified CSS Chart for Demo */}
                    <div className="h-64 flex items-end gap-2 border-l border-b border-gray-200 pb-2 pl-2">
                        {mockHistory.map((point, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1 group relative">
                                {/* Traffic Bar */}
                                <div
                                    className="w-full bg-blue-100 hover:bg-blue-200 transition-colors rounded-t"
                                    style={{ height: `${point.traffic / 5}px` }}
                                ></div>
                                {/* Replica Line Marker */}
                                <div
                                    className="w-3 h-3 bg-rose-500 rounded-full absolute"
                                    style={{ bottom: `${point.replicas * 12}px` }}
                                ></div>
                                <div className="text-[10px] text-gray-400 mt-2">{point.time}</div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity w-32 text-center z-10">
                                    {point.traffic} users<br />
                                    {point.replicas} pods
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-100"></div> <span>User Traffic</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-rose-500 rounded-full"></div> <span>Deployed Pods</span>
                        </div>
                    </div>
                </div>

                {/* AI Decision Log */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-700 mb-6">AI Decision Log</h2>
                    <div className="space-y-6 relative border-l-2 border-gray-100 ml-3 pl-6">
                        {mockHistory.map((point, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                                <div className="text-xs font-mono text-gray-400 mb-1">{point.time}</div>
                                <div className="text-sm text-gray-800 font-medium">{point.reason}</div>
                                <div className="mt-1 text-xs text-blue-600 font-bold">
                                    Scaled to {point.replicas} Replicas
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
