import React, { useState, useEffect } from 'react';
import { Tenant } from '../../server/src/models/tenant'; // Importing type for reference

export const TenantDashboard: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [newTenantName, setNewTenantName] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>('basic');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/tenants');
            const data = await res.json();
            setTenants(data);
        } catch (err) {
            console.error('Failed to fetch tenants', err);
        }
    };

    const handleCreateTenant = async () => {
        setLoading(true);
        try {
            await fetch('http://localhost:3001/api/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTenantName, plan: selectedPlan })
            });
            setNewTenantName('');
            fetchTenants();
        } catch (err) {
            console.error('Error creating tenant', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-serif text-gray-800 mb-8">Tenant Management</h1>

            {/* Create Tenant Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-700">Create New Tenant</h2>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Organization Name</label>
                        <input
                            className="w-full p-3 border rounded-lg bg-gray-50 font-mono text-sm focus:border-blue-500 outline-none"
                            placeholder="e.g. Acme Corp"
                            value={newTenantName}
                            onChange={e => setNewTenantName(e.target.value)}
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Plan</label>
                        <select
                            className="w-full p-3 border rounded-lg bg-gray-50 font-mono text-sm outline-none"
                            value={selectedPlan}
                            onChange={(e: any) => setSelectedPlan(e.target.value)}
                        >
                            <option value="basic">Basic (Shared)</option>
                            <option value="pro">Pro (High Perf)</option>
                        </select>
                    </div>
                    <button
                        onClick={handleCreateTenant}
                        disabled={loading || !newTenantName}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Creating Namespace...' : 'Create Tenant'}
                    </button>
                </div>
            </div>

            {/* Tenant List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map(tenant => (
                    <div key={tenant.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-2 text-xs font-bold uppercase tracking-wider ${tenant.plan === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'} rounded-bl-xl`}>
                            {tenant.plan}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{tenant.name}</h3>
                        <p className="text-xs font-mono text-gray-400 mb-4">{tenant.namespace}</p>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">CPU Quota</span>
                                <span className="font-mono font-bold">{tenant.quotas.cpu}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Mem Quota</span>
                                <span className="font-mono font-bold">{tenant.quotas.memory}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Pod Limit</span>
                                <span className="font-mono font-bold">{tenant.quotas.pods}</span>
                            </div>
                        </div>

                        <button className="w-full py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Manage Apps
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
