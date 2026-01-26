import React, { useState, useEffect, useCallback } from 'react';
import { Pod, PodStatus, TrafficData, PredictionResult } from './types';
import Header from './components/Header';
import OverviewTab from './components/tabs/OverviewTab';
import ClusterTab from './components/tabs/ClusterTab';
import MetricsTab from './components/tabs/MetricsTab';
import LogsTab from './components/tabs/LogsTab';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import ChatInterface from './components/ChatInterface';
import { analyzeUrlTraffic } from './services/groqService';

export interface ScalingLog {
  id: string;
  timestamp: string;
  type: 'info' | 'scaling' | 'error';
  message: string;
}

export type AppView = 'overview' | 'infrastructure' | 'metrics' | 'events' | 'settings';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('overview');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
  useEffect(() => {
    if (!isLoggedIn || !prediction) return;

    const interval = setInterval(() => {
      const targetCount = prediction.recommendedPods;

      setPods(prevPods => {
        let nextPods = [...prevPods];

        // 1. Clean up pods that finished terminating
        const beforeCount = nextPods.length;
        nextPods = nextPods.filter(p => p.status !== PodStatus.TERMINATING || Math.random() > 0.4);
        if (beforeCount > nextPods.length) {
          addLog(`Resource cleanup: Removed ${beforeCount - nextPods.length} terminated pod(s).`);
        }

        // 2. Resource mutation and Pending->Running transition
        nextPods = nextPods.map(p => {
          if (p.status === PodStatus.PENDING && Math.random() > 0.6) {
            addLog(`Pod ${p.name} transition: READY`, 'scaling');
            return { ...p, status: PodStatus.RUNNING };
          }
          if (p.status === PodStatus.RUNNING) {
            return {
              ...p,
              cpu: Math.max(5, Math.min(95, p.cpu + (Math.random() * 8 - 4))),
              memory: Math.max(64, Math.min(480, p.memory + (Math.random() * 16 - 8)))
            };
          }
          return p;
        });

        // 3. Scaling Reconciler
        const activeCount = nextPods.filter(p => p.status !== PodStatus.TERMINATING).length;
        const diff = targetCount - activeCount;

        if (diff > 0) {
          const toAdd = Math.min(diff, 2);
          addLog(`HPA Scaling: Adding ${toAdd} pod(s) to meet target demand.`, 'scaling');
          for (let i = 0; i < toAdd; i++) {
            nextPods.push({
              id: `pod-${Math.random().toString(36).substr(2, 6)}`,
              name: `worker-${Math.random().toString(36).substr(2, 4)}`,
              status: PodStatus.PENDING,
              cpu: 0,
              memory: 128,
              startTime: Date.now()
            });
          }
        } else if (diff < 0) {
          const toRemove = Math.min(Math.abs(diff), 2);
          addLog(`HPA Scaling: Terminating ${toRemove} pod(s) due to over-provisioning.`, 'scaling');
          let removedCount = 0;
          nextPods = nextPods.map(p => {
            if (removedCount < toRemove && p.status === PodStatus.RUNNING) {
              removedCount++;
              return { ...p, status: PodStatus.TERMINATING };
            }
            return p;
          });
        }

        return nextPods;
      });

      // Update Traffic history metrics
      setTrafficHistory(prev => {
        const lastUsers = prev.length > 0 ? prev[prev.length - 1].users : prediction.estimatedUsers;
        const volatility = prediction.estimatedUsers * 0.05;
        const jitter = (Math.random() * volatility * 2) - volatility;

        const activePods = pods.filter(p => p.status === PodStatus.RUNNING);
        const avgCpu = activePods.length > 0
          ? activePods.reduce((acc, p) => acc + p.cpu, 0) / activePods.length
          : 0;
        const avgMemory = activePods.length > 0
          ? activePods.reduce((acc, p) => acc + p.memory, 0) / activePods.length
          : 0;

        const newData = {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          users: Math.max(10, Math.floor(lastUsers + jitter)),
          pods: activePods.length,
          cpu: avgCpu,
          memory: avgMemory
        };
        return [...prev, newData].slice(-40);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoggedIn, prediction, addLog, pods.length]);

  const handleAnalyze = async (urlToAnalyze: string) => {
    setIsAnalyzing(true);
    addLog(`Initiating AI traffic analysis for ${urlToAnalyze}...`);
    try {
      const result = await analyzeUrlTraffic(urlToAnalyze);
      setPrediction(result);
      setUrl(urlToAnalyze);
      addLog(`Analysis complete. Estimated users: ${result.estimatedUsers.toLocaleString()}.`, 'info');
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

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewTab url={url} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} prediction={prediction} />;
      case 'infrastructure':
        return <ClusterTab pods={pods} prediction={prediction} />;
      case 'metrics':
        return <MetricsTab trafficHistory={trafficHistory} prediction={prediction} />;
      case 'events':
        return <LogsTab logs={logs} prediction={prediction} />;
      case 'settings':
        return <SettingsPage theme={theme} onThemeChange={setTheme} />;
      default:
        return <OverviewTab url={url} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} prediction={prediction} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige flex flex-col transition-colors duration-300 relative">
      <Header
        onNavigate={setCurrentView}
        currentView={currentView}
        onLogout={() => setIsLoggedIn(false)}
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
