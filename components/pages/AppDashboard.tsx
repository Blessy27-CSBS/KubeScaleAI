import React, { useState, useEffect } from 'react';
import { Application } from '../../server/src/models/app';
import { DeployWizard } from './DeployWizard';

interface Props {
    tenantId?: string; // Optional: If null, show all apps (Admin view)
}

export const AppDashboard: React.FC<Props> = ({ tenantId }) => {
    const [apps, setApps] = useState<Application[]>([]);
    const [showDeployModal, setShowDeployModal] = useState(false);

    useEffect(() => {
        fetchApps();
    }, [tenantId]);

    const fetchApps = async () => {
        try {
            const url = tenantId
                ? `http://localhost:3001/api/apps?tenantId=${tenantId}`
                : `http://localhost:3001/api/apps`; // Fetch all if no tenant specified

            const res = await fetch(url);
            const data = await res.json();
            setApps(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeploy = async (config: any) => {
        try {
            await fetch('http://localhost:3001/api/apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            setShowDeployModal(false);
            fetchApps(); // Refresh list
        } catch (err) {
            console.error('Deployment failed', err);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif text-gray-800">Applications</h1>
                <button
                    onClick={() => setShowDeployModal(true)}
                    className="px-6 py-3 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all"
                >
                    + Deploy New App
                </button>
            </div>

            <div className="grid gap-6">
                {apps.map(app => (
                    <div key={app.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold 
                                ${app.config.scalingPolicy === 'cost-first' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {app.name[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{app.name}</h3>
                                <p className="text-xs text-gray-400 font-mono">{app.imageUrl}</p>
                            </div>
                        </div>

                        <div className="flex gap-8 text-sm">
                            <div className="text-center">
                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Status</div>
                                <div className={`font-bold ${app.status === 'running' ? 'text-green-500' : 'text-orange-500'}`}>
                                    {app.status.toUpperCase()}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Replicas</div>
                                <div className="font-mono font-bold text-gray-700">
                                    {app.metrics?.currentReplicas} / {app.config.replicas.max}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Policy</div>
                                <div className="font-bold text-gray-700 capitalize">
                                    {app.config.scalingPolicy.replace('-', ' ')}
                                </div>
                            </div>
                        </div>

                        <a href={`http://localhost:3001/apps/${app.name}`} target="_blank" className="text-blue-500 hover:underline font-bold text-sm">
                            Open App &rarr;
                        </a>
                    </div>
                ))}
            </div>

            {/* Deploy Wizard Modal */}
            {showDeployModal && (
                <DeployWizard
                    onClose={() => setShowDeployModal(false)}
                    onDeploy={handleDeploy}
                />
            )}
        </div>
    );
};
