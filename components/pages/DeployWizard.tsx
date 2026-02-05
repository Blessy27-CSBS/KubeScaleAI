import React, { useState, useEffect } from 'react';
import { Tenant } from '../../server/src/models/tenant';

interface Props {
    onClose: () => void;
    onDeploy: (config: any) => Promise<void>;
}

export const DeployWizard: React.FC<Props> = ({ onClose, onDeploy }) => {
    const [step, setStep] = useState(1);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [appName, setAppName] = useState('');
    const [image, setImage] = useState('');
    const [port, setPort] = useState(80);
    const [replicas, setReplicas] = useState({ min: 1, max: 10 });
    const [resources, setResources] = useState({ cpu: '100m', memory: '128Mi' });
    const [scalingPolicy, setScalingPolicy] = useState('balanced');

    useEffect(() => {
        // Fetch tenants for selection
        fetch('http://localhost:3001/api/tenants')
            .then(res => res.json())
            .then(data => {
                setTenants(data);
                if (data.length > 0) setSelectedTenantId(data[0].id);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch tenants", err);
                setIsLoading(false);
            });
    }, []);

    const handleSubmit = async () => {
        await onDeploy({
            tenantId: selectedTenantId,
            name: appName,
            image,
            config: {
                port,
                replicas,
                resources,
                scalingPolicy
            }
        });
    };

    // --- Empty State: No Tenants Used ---
    if (!isLoading && tenants.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl w-full max-w-lg p-8 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600 text-2xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-serif text-gray-800 mb-2">Organization Required</h2>
                    <p className="text-gray-500 mb-8">
                        You need to create an Organization (Tenant) before you can deploy applications. This isolates your resources.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <a href="#" onClick={(e) => { e.preventDefault(); onClose(); window.location.reload(); /* Hack to force Nav */ }}
                            className="px-6 py-2 bg-brand-rose text-white font-bold rounded-lg hover:bg-brand-rose/90">
                            Go to Tenants Dashboard
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-serif text-gray-800">Deploy New Application</h2>
                        <p className="text-sm text-gray-500">Step {step} of 3</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1">

                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Target Tenant</label>
                                <select
                                    className="w-full p-3 border rounded-lg bg-white"
                                    value={selectedTenantId}
                                    onChange={e => setSelectedTenantId(e.target.value)}
                                >
                                    {tenants.map(t => <option key={t.id} value={t.id}>{t.name} ({t.plan})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">App Name</label>
                                    <input
                                        className="w-full p-3 border rounded-lg"
                                        placeholder="my-app"
                                        value={appName}
                                        onChange={e => setAppName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Port</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border rounded-lg"
                                        value={port}
                                        onChange={e => setPort(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Container Image</label>
                                <input
                                    className="w-full p-3 border rounded-lg font-mono text-sm"
                                    placeholder="nginx:latest or registry.digitalocean.com/my/app:v1"
                                    value={image}
                                    onChange={e => setImage(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Resources & Scaling */}
                    {step === 2 && (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Scaling Policy</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['cost-first', 'balanced', 'performance-first'].map(policy => (
                                        <div
                                            key={policy}
                                            onClick={() => setScalingPolicy(policy)}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all ${scalingPolicy === policy ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="font-bold text-gray-700 capitalize mb-1">{policy.replace('-', ' ')}</div>
                                            <div className="text-xs text-gray-500">
                                                {policy === 'cost-first' ? 'Aggressive scale-down to 0.' :
                                                    policy === 'balanced' ? 'Standard HPA rules.' : 'Pre-scales on prediction.'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Replicas (Min / Max)</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number" className="w-full p-3 border rounded-lg text-center"
                                            value={replicas.min}
                                            onChange={e => setReplicas({ ...replicas, min: Number(e.target.value) })}
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="number" className="w-full p-3 border rounded-lg text-center"
                                            value={replicas.max}
                                            onChange={e => setReplicas({ ...replicas, max: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Pod Size</label>
                                    <select
                                        className="w-full p-3 border rounded-lg bg-white"
                                        onChange={e => {
                                            const [cpu, memory] = e.target.value.split(',');
                                            setResources({ cpu, memory });
                                        }}
                                    >
                                        <option value="100m,128Mi">Micro (0.1 CPU, 128MB)</option>
                                        <option value="500m,512Mi">Standard (0.5 CPU, 512MB)</option>
                                        <option value="1000m,1Gi">Large (1 CPU, 1GB)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">🚀</div>
                            <h3 className="text-2xl font-serif text-gray-800">Ready to Deploy?</h3>
                            <div className="bg-gray-50 p-6 rounded-xl text-left space-y-3 font-mono text-sm border border-gray-100">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">App:</span>
                                    <span className="font-bold">{appName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Image:</span>
                                    <span className="font-bold">{image || 'nginx:alpine'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tenant:</span>
                                    <span className="font-bold">{selectedTenantId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Policy:</span>
                                    <span className="font-bold text-blue-600">{scalingPolicy}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-200">
                                    <span className="text-gray-500">Est. Cost:</span>
                                    <span className="font-bold text-green-600">~${(Number(resources.cpu.replace('m', '')) / 1000 * 10 + 5).toFixed(2)} / mo</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50/50">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Back</button>
                    ) : (
                        <div></div>
                    )}
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!appName}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 shadow-lg shadow-green-200"
                        >
                            Deploy Application
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
