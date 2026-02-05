import React, { useState, useEffect } from 'react';
import { AppView } from '../../App';
import { Tenant } from '../../server/src/models/tenant';

interface DeployTabProps {
    onNavigate?: (view: AppView) => void;
}

const DeployTab: React.FC<DeployTabProps> = ({ onNavigate }) => {
    const [step, setStep] = useState(1);
    const [repoUrl, setRepoUrl] = useState('');
    const [minReplicas, setMinReplicas] = useState(0);
    const [maxReplicas, setMaxReplicas] = useState(10);
    const [selectedTenantId, setSelectedTenantId] = useState<string>('');
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploymentStatus, setDeploymentStatus] = useState<string>('');

    // Fetch Tenants on Mount
    useEffect(() => {
        fetch('http://localhost:3001/api/tenants')
            .then(res => res.json())
            .then(data => {
                setTenants(data);
                if (data.length > 0) setSelectedTenantId(data[0].id);
            })
            .catch(err => console.error("Failed to fetch tenants", err));
    }, []);

    const handleDeploy = async () => {
        if (!selectedTenantId) {
            alert("Please select an Organization (Tenant) first.");
            return;
        }

        setIsDeploying(true);
        setDeploymentStatus('Connecting to Scale-to-Zero Backend...');

        try {
            // Correct API Endpoint: /api/apps (Post-Refactor)
            const response = await fetch('http://localhost:3001/api/apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: selectedTenantId,
                    name: repoUrl.split('/').pop()?.replace('.git', '') || 'my-app',
                    image: repoUrl,
                    config: {
                        port: 80,
                        replicas: { min: minReplicas, max: maxReplicas },
                        resources: { cpu: '100m', memory: '128Mi' },
                        scalingPolicy: minReplicas === 0 ? 'cost-first' : 'performance-first' // Mapping logic
                    }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Deployment failed');
            }

            setDeploymentStatus('Allocating KubeScale AI Resources...');
            setTimeout(() => {
                setStep(3);
                setIsDeploying(false);
            }, 2000);

        } catch (error: any) {
            console.error("Deployment error:", error);
            setDeploymentStatus(`Error: ${error.message}`);
            setTimeout(() => setIsDeploying(false), 3000);
        }
    };

    // --- Empty State: No Tenants ---
    if (tenants.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-24 text-center">
                <div className="w-24 h-24 bg-brand-rose/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-rose text-4xl">🏢</div>
                <h1 className="text-4xl font-serif text-brand-brown mb-4">Welcome to Mini-AWS</h1>
                <p className="text-brand-brown/60 mb-8 max-w-xl mx-auto">
                    To start deploying applications, you first need to create an Organization (Tenant). This isolates your resources and billing.
                </p>
                <button
                    onClick={() => onNavigate && onNavigate('tenants')}
                    className="px-8 py-4 bg-brand-rose text-white rounded-xl font-bold shadow-xl hover:scale-105 transition-transform"
                >
                    Create Organization &rarr;
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 animate-fadeIn">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-serif text-brand-brown mb-4">Launch Your App</h1>
                <p className="text-brand-brown/60">
                    Deploy to <b>{tenants.find(t => t.id === selectedTenantId)?.name}</b> in seconds.
                </p>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-brand-brown/5 overflow-hidden">
                {/* Progress Bar */}
                <div className="flex border-b border-brand-brown/5 bg-brand-cream/30">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`flex-1 py-4 text-center text-sm font-bold uppercase tracking-widest transition-colors ${step >= s ? 'text-brand-rose bg-white' : 'text-brand-brown/30'}`}>
                            Step {s}
                        </div>
                    ))}
                </div>

                <div className="p-8 md:p-12">
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Tenant Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-brand-brown/70 uppercase tracking-widest">Select Organization</label>
                                <select
                                    className="w-full p-4 rounded-xl bg-brand-beige/50 border border-brand-brown/10 font-bold text-brand-brown"
                                    value={selectedTenantId}
                                    onChange={(e) => setSelectedTenantId(e.target.value)}
                                >
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.plan.toUpperCase()})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-brand-brown/70 uppercase tracking-widest">Container Image URL</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="nginx:latest or registry.digitalocean.com/myapp:v1"
                                        className="flex-1 px-6 py-4 rounded-xl bg-brand-beige/50 border border-brand-brown/10 focus:outline-none focus:border-brand-rose/50 font-mono text-sm"
                                        value={repoUrl}
                                        onChange={(e) => setRepoUrl(e.target.value)}
                                    />
                                    <button
                                        disabled={!repoUrl}
                                        onClick={() => setStep(2)}
                                        className="px-8 py-4 bg-brand-rose text-white rounded-xl font-bold hover:bg-brand-rose/90 disabled:opacity-50 transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-fadeIn">
                            {!isDeploying ? (
                                <div className="space-y-6 max-w-md mx-auto">
                                    <div className="p-5 bg-white rounded-xl border border-brand-brown/10 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 bg-brand-rose/10 rounded-full flex items-center justify-center text-brand-rose text-xs">⚡</div>
                                            <span className="text-sm font-bold text-brand-brown">Scaling Policy</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => { setMinReplicas(0); setMaxReplicas(10); }}
                                                className={`p-3 rounded-lg border text-left transition-all ${minReplicas === 0 ? 'border-brand-rose bg-brand-rose/5 ring-1 ring-brand-rose' : 'border-brand-brown/10 hover:border-brand-brown/30'}`}
                                            >
                                                <div className="text-xs font-bold text-brand-brown mb-1">Cost Optimized (Scale-to-0)</div>
                                            </button>
                                            <button
                                                onClick={() => { setMinReplicas(1); setMaxReplicas(20); }}
                                                className={`p-3 rounded-lg border text-left transition-all ${minReplicas > 0 ? 'border-brand-rose bg-brand-rose/5 ring-1 ring-brand-rose' : 'border-brand-brown/10 hover:border-brand-brown/30'}`}
                                            >
                                                <div className="text-xs font-bold text-brand-brown mb-1">High Availability (Min 1)</div>
                                            </button>
                                        </div>

                                        <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center border border-green-100">
                                            <span className="text-xs font-bold text-green-800 uppercase tracking-widest">Est. Monthly Cost</span>
                                            <span className="text-lg font-serif text-green-700">
                                                {minReplicas === 0 ? '~ $5.00' : '~ $17.00'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleDeploy}
                                        className="w-full py-4 bg-brand-rose text-white rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-rose/20"
                                    >
                                        Deploy Application
                                    </button>
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center space-y-6">
                                    <div className="w-16 h-16 border-4 border-brand-rose/20 border-t-brand-rose rounded-full animate-spin"></div>
                                    <div className="text-center">
                                        <h4 className="font-serif text-xl text-brand-brown">{deploymentStatus}</h4>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-6 animate-fadeIn">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 animate-bounce">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="text-3xl font-serif text-brand-brown">Success!</h2>
                            <p className="text-brand-brown/60">Application deployed to namespace: <b>{tenants.find(t => t.id === selectedTenantId)?.namespace}</b></p>

                            <div className="flex gap-4 justify-center mt-8">
                                <button onClick={() => onNavigate && onNavigate('apps')} className="px-6 py-2 bg-brand-rose text-white rounded-lg font-bold">View in App Dashboard</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeployTab;
