import React, { useState, useEffect, useCallback } from 'react';
import { Pod, PodStatus, TrafficData, PredictionResult, User } from './types';
import Header from './components/Header';
import OverviewTab from './components/tabs/OverviewTab';
import ClusterTab from './components/tabs/ClusterTab';
import MetricsTab from './components/tabs/MetricsTab';
import CostTab from './components/tabs/CostTab';
import DeployTab from './components/tabs/DeployTab';
import LogsTab from './components/tabs/LogsTab';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import ChatInterface from './components/ChatInterface';
import { analyzeUrlTraffic } from './services/groqService';
import { TenantDashboard } from './components/pages/TenantDashboard';
import { AppDashboard } from './components/pages/AppDashboard';

export interface ScalingLog {
  id: string;
  timestamp: string;
  type: 'info' | 'scaling' | 'error';
  message: string;
}

export type AppView = 'deploy' | 'overview' | 'infrastructure' | 'metrics' | 'cost' | 'events' | 'settings' | 'tenants' | 'apps';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('overview');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isRealClusterMode, setIsRealClusterMode] = useState(false);

  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [pods, setPods] = useState<Pod[]>([]);
  const [trafficHistory, setTrafficHistory] = useState<TrafficData[]>([]);
  const [logs, setLogs] = useState<ScalingLog[]>([]);

  // Force light mode behavior for the clean white theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const addLog = useCallback((message: string, type: 'info' | 'scaling' | 'error' = 'info') => {
    const newLog: ScalingLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  // Kubernetes HPA Simulation Loop
  // Unified Backend/Simulation Loop
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    let backendAvailable = false;

    const syncWithBackend = async () => {
      try {
        // Fetch Pods
        const podRes = await fetch('http://localhost:3001/api/pods');
        if (!podRes.ok) throw new Error('Backend unreachable');
        const podData = await podRes.json();

        // Fetch Traffic State
        const stateRes = await fetch('http://localhost:3001/api/state');
        const stateData = await stateRes.json();

        if (isMounted) {
          if (!backendAvailable) {
            addLog("Connected to KubeScale Orchestration Backend.", "info");
            backendAvailable = true;
          }

          if (podData.pods) {
            setPods(podData.pods.map((p: any) => ({
              ...p,
              status: p.status === 'RUNNING' ? PodStatus.RUNNING
                : p.status === 'PENDING' ? PodStatus.PENDING
                  : p.status === 'TERMINATING' ? PodStatus.TERMINATING
                    : PodStatus.FAILED
            })));
          }

          // Update Traffic History from Backend State
          const currentUsers = Object.values(stateData.traffic || {}).reduce((a: any, b: any) => a + b, 0) as number;

          setTrafficHistory(prev => {
            const activePods = podData.pods.filter((p: any) => p.status === 'RUNNING');
            const avgCpu = activePods.length > 0
              ? activePods.reduce((acc: any, p: any) => acc + p.cpu, 0) / activePods.length
              : 0;
            const avgMemory = activePods.length > 0
              ? activePods.reduce((acc: any, p: any) => acc + p.memory, 0) / activePods.length
              : 0;

            const newData = {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              users: currentUsers || 0,
              pods: activePods.length,
              cpu: avgCpu,
              memory: avgMemory
            };
            return [...prev, newData].slice(-40);
          });
        }
      } catch (e) {
        // Fallback to Frontend Simulation if backend is down
        if (backendAvailable) {
          addLog("Lost connection to backend. Reverting to local simulation.", "error");
          backendAvailable = false;
        }
        runFrontendSimulation();
      }
    };

    const runFrontendSimulation = () => {
      if (!prediction) return;

      const targetCount = prediction.recommendedPods;

      // Update Pods
      setPods(prevPods => {
        let nextPods = [...prevPods];
        nextPods = nextPods.filter(p => p.status !== PodStatus.TERMINATING || Math.random() > 0.4);
        nextPods = nextPods.map(p => {
          if (p.status === PodStatus.PENDING && Math.random() > 0.6) return { ...p, status: PodStatus.RUNNING };
          if (p.status === PodStatus.RUNNING) {
            return { ...p, cpu: Math.max(5, Math.min(95, p.cpu + (Math.random() * 8 - 4))) };
          }
          return p;
        });
        const activeCount = nextPods.filter(p => p.status !== PodStatus.TERMINATING).length;
        const diff = targetCount - activeCount;

        if (diff > 0) {
          const toAdd = Math.min(diff, 2);
          for (let i = 0; i < toAdd; i++) {
            nextPods.push({
              id: `sim-${Math.random()}`,
              name: `worker-${Math.random().toString(36).substr(2, 4)}`,
              status: PodStatus.PENDING,
              cpu: 0, memory: 128, startTime: Date.now()
            });
          }
        } else if (diff < 0) {
          const toRemove = Math.min(Math.abs(diff), 2);
          let removed = 0;
          nextPods = nextPods.map(p => {
            if (removed < toRemove && p.status === PodStatus.RUNNING) {
              removed++;
              return { ...p, status: PodStatus.TERMINATING };
            }
            return p;
          });
        }
        return nextPods;
      });

      // Update Traffic History (Simulation Fallback)
      setTrafficHistory(prev => {
        const lastUsers = prev.length > 0 ? prev[prev.length - 1].users : prediction.estimatedUsers;
        const volatility = prediction.estimatedUsers * 0.05;
        const jitter = (Math.random() * volatility * 2) - volatility;
        const activePods = pods.filter(p => p.status === PodStatus.RUNNING);

        const newData = {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          users: Math.max(10, Math.floor(lastUsers + jitter)),
          pods: activePods.length,
          cpu: 50, memory: 256
        };
        return [...prev, newData].slice(-40);
      });
    };

    const interval = setInterval(syncWithBackend, 2000);
    syncWithBackend(); // Initial call

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, prediction, addLog]);

  const handleAnalyze = async (urlToAnalyze: string) => {
    setIsAnalyzing(true);
    addLog(`Initiating AI traffic analysis for ${urlToAnalyze}...`);
    try {
      const result = await analyzeUrlTraffic(urlToAnalyze);
      setPrediction(result);
      setUrl(urlToAnalyze);
      addLog(`Analysis complete. Estimated users: ${result.estimatedUsers.toLocaleString()}.`, 'info');

      // NEW: Send AI Prediction to Backend to drive scaling
      try {
        await fetch('http://localhost:3001/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            predictedUsers: result.estimatedUsers
          })
        });
        addLog("Scaling signal sent to backend orchestrator.", "scaling");
      } catch (e) {
        console.warn("Failed to sync prediction with backend", e);
      }

      setCurrentView('infrastructure');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // Check for quota exceeded error
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        addLog('Quota exceeded: Your Groq API quota has been exhausted. Please check your billing plan at https://console.groq.com.', 'error');
      } else if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
        addLog('Authentication failed: Invalid or missing API key. Please check your settings.', 'error');
      } else {
        addLog(`AI analysis failed: ${errorMessage}`, 'error');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return <LoginPage onLogin={(u) => setUser(u)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'deploy':
        return <DeployTab onNavigate={setCurrentView} />;
      case 'overview':
        return <OverviewTab url={url} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} prediction={prediction} onNavigate={setCurrentView} />;
      case 'infrastructure':
        return <ClusterTab pods={pods} prediction={prediction} />;
      case 'metrics':
        return <MetricsTab trafficHistory={trafficHistory} prediction={prediction} />;
      case 'cost':
        return <CostTab prediction={prediction} pods={pods} />;
      case 'events':
        return <LogsTab logs={logs} prediction={prediction} />;
      case 'settings':
        return (
          <SettingsPage
            theme={theme}
            onThemeChange={setTheme}
            user={user}
            isRealClusterMode={isRealClusterMode}
            onToggleRealClusterMode={setIsRealClusterMode}
          />
        );
      case 'tenants':
        return <TenantDashboard />;
      case 'apps':
        // Hardcoded tenant for now, in real app this would selection based
        return <AppDashboard />;
      default:
        return <OverviewTab url={url} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} prediction={prediction} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige flex flex-col transition-colors duration-300 relative">
      <Header
        onNavigate={setCurrentView}
        currentView={currentView}
        onLogout={() => setUser(null)}
      />

      <div className="flex-1 animate-fadeIn pb-24">
        {renderContent()}
      </div>

      <ChatInterface prediction={prediction} />

      <footer className="py-12 border-t border-brand-brown/5 bg-brand-cream mt-12">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-brand-brown/40 text-[10px] font-bold uppercase tracking-widest">
          <span>KubeScale AI Engine v1.0.4</span>
          <span className="flex gap-4 font-serif italic normal-case text-xs text-brand-rose">
            Aesthetic Nova AI Resilience Protocol
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
