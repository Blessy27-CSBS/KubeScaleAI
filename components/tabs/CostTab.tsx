import React, { useMemo } from 'react';
import { PredictionResult, Pod, PodStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface CostTabProps {
    prediction: PredictionResult | null;
    pods: Pod[];
}

// Mock pricing constants (e.g., AWS m5.large)
const HOURLY_RATE_PER_POD = 0.096; // $0.096/hr (AWS Baseline)
const MONTHLY_RATE_PER_POD = HOURLY_RATE_PER_POD * 24 * 30;

const CostTab: React.FC<CostTabProps> = ({ prediction, pods }) => {
    const activePods = pods.filter(p => p.status === PodStatus.RUNNING).length;

    // Calculate costs
    const currentHourlyCost = activePods * HOURLY_RATE_PER_POD;
    const optimizedHourlyCost = (prediction?.recommendedPods || activePods) * HOURLY_RATE_PER_POD;
    const potentialSavings = Math.max(0, currentHourlyCost - optimizedHourlyCost);

    const monthlyProjection = useMemo(() => {
        return [
            { name: 'Week 1', standard: 1200, aiOptimized: 850 },
            { name: 'Week 2', standard: 1350, aiOptimized: 920 },
            { name: 'Week 3', standard: 1280, aiOptimized: 890 },
            { name: 'Week 4', standard: 1420, aiOptimized: 950 },
        ];
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-serif text-brand-brown">Cost Analysis & Savings</h2>
                <p className="text-brand-brown/60 text-sm">Real-time financial impact of AI-driven scaling.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Current Spend */}
                <div className="bg-white p-6 rounded-3xl border border-brand-brown/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-brand-rose/10 flex items-center justify-center">
                            <span className="text-brand-rose text-lg">$</span>
                        </div>
                        <span className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-widest">AWS / Azure Estimated</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-serif text-brand-brown">${currentHourlyCost.toFixed(2)}</span>
                        <span className="text-sm text-brand-brown/40">/hour</span>
                    </div>
                    <p className="text-xs text-brand-brown/60 mt-2">Based on {activePods} active pods</p>
                </div>

                {/* Card 2: Optimized Spend */}
                <div className="bg-white p-6 rounded-3xl border border-brand-brown/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center">
                            <span className="text-brand-accent text-lg">✨</span>
                        </div>
                        <span className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-widest">KubeScale Managed</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-serif text-brand-brown">${optimizedHourlyCost.toFixed(2)}</span>
                        <span className="text-sm text-brand-brown/40">/hour</span>
                    </div>
                    <p className="text-xs text-brand-brown/60 mt-2">Targeting {prediction?.recommendedPods || 0} pods</p>
                </div>

                {/* Card 3: Monthly Savings */}
                <div className="bg-gradient-to-br from-brand-rose to-pink-600 p-6 rounded-3xl shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-white text-lg">📉</span>
                        </div>
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Projected Monthly Savings</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-serif text-white">${(potentialSavings * 24 * 30).toFixed(2)}</span>
                        <span className="text-sm text-white/80">/mo</span>
                    </div>
                    <p className="text-xs text-white/80 mt-2">Est. annual savings: <span className="font-bold">${(potentialSavings * 24 * 365).toFixed(0)}</span></p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-brand-brown/5 shadow-sm">
                    <h3 className="text-lg font-serif text-brand-brown mb-6">30-Day Cost Projection</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyProjection}>
                                <defs>
                                    <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                />
                                <Area type="monotone" dataKey="standard" stroke="#ef4444" fillOpacity={1} fill="url(#colorStandard)" strokeWidth={2} name="AWS / Azure Standard" />
                                <Area type="monotone" dataKey="aiOptimized" stroke="#10B981" fillOpacity={1} fill="url(#colorAi)" strokeWidth={2} name="KubeScale AI" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-brand-cream/50 p-8 rounded-[2rem] border border-brand-brown/5 flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 bg-brand-rose/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <span className="text-3xl">💡</span>
                    </div>
                    <h3 className="text-xl font-serif text-brand-brown mb-2">Optimization Insight</h3>
                    <p className="text-brand-brown/70 leading-relaxed max-w-md">
                        Based on your startup workload, traditional cloud providers would over-charge by <span className="font-bold text-brand-rose">24%</span>.
                        KubeScale's <strong>Scale-to-Zero</strong> feature ensures you pay $0 when no users are active.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CostTab;
