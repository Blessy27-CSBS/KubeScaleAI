import React, { useState } from 'react';
import { PredictionResult } from '../../types';
import { AppView } from '../../App';

interface OverviewTabProps {
  url: string;
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  prediction: PredictionResult | null;
  onNavigate?: (view: AppView) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ url, onAnalyze, isAnalyzing, prediction, onNavigate }) => {
  const [inputUrl, setInputUrl] = useState(url);
  const [error, setError] = useState<string | null>(null);

  const handleRun = () => {
    if (!inputUrl.trim()) {
      setError("Please enter a URL.");
      return;
    }
    setError(null);
    onAnalyze(inputUrl);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 space-y-8">
          <div className="relative">
            <span className="text-brand-rose text-4xl absolute -top-10 -left-6 opacity-40">✦ ✦</span>
            <h1 className="text-6xl font-serif text-brand-brown leading-tight">
              Cloud Resilience <br />
              <span className="text-brand-rose italic">Orchestrated by</span> <br />
              Nova AI
            </h1>
          </div>
          <p className="text-brand-brown/60 text-sm leading-relaxed max-w-md">
            Predictive scaling powered by real-time web popularity metrics. Nova AI analyzes global demand trends to ensure your Kubernetes cluster is always one step ahead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste website URL here..."
              className="px-8 py-5 rounded-full bg-white border border-brand-brown/10 focus:outline-none focus:ring-4 focus:ring-brand-rose/5 w-full sm:w-80 shadow-sm font-medium text-brand-brown placeholder:text-brand-brown/20"
            />
            <button
              onClick={handleRun}
              disabled={isAnalyzing}
              className="px-10 py-5 bg-brand-rose text-white rounded-full font-bold flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-rose/20 disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing..." : "Start Scaling"}
              {!isAnalyzing && <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">▶</div>}
            </button>
          </div>
          {error && <p className="text-xs font-bold text-red-500">{error}</p>}

          <div className="text-sm text-brand-brown/40">
            Don't have an app running? <button onClick={() => onNavigate && onNavigate('deploy')} className="text-brand-rose font-bold hover:underline">Deploy a new startup</button> for $0/mo.
          </div>
        </div>

        <div className="lg:w-1/2 flex justify-center relative">
          <div className="relative w-full max-w-sm">
            <div className="absolute top-1/2 -right-10 flex flex-col gap-4">
              <div className="w-4 h-4 rounded-full bg-brand-softPink"></div>
              <div className="w-4 h-4 rounded-full bg-brand-rose/20"></div>
              <div className="w-4 h-4 rounded-full bg-brand-brown/10"></div>
            </div>
            <div className="aspect-[4/5] bg-white organic-arches overflow-hidden tape-effect soft-shadow border border-brand-brown/5">
              <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-32 h-32 rounded-full border-4 border-brand-rose/10 flex items-center justify-center bg-brand-softPink">
                  <span className="text-6xl">✨</span>
                </div>
                <h3 className="text-2xl font-serif text-brand-brown italic">Nova Pulse</h3>
                <div className="w-24 h-1 bg-brand-rose/20 rounded-full"></div>
                <p className="text-xs text-brand-rose/60 font-bold uppercase tracking-widest">Real-time Grounding Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      {prediction && (
        <section className="flex flex-col lg:flex-row items-center gap-16 animate-fadeIn">
          <div className="lg:w-1/2 order-2 lg:order-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="aspect-square bg-white organic-arches overflow-hidden soft-shadow border-8 border-brand-softPink">
                <div className="w-full h-full bg-gradient-to-br from-white to-brand-softPink flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <h4 className="text-xs font-black text-brand-rose uppercase tracking-widest">Analysis Sources</h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {prediction.sources.map((source, i) => (
                      <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="text-[10px] px-3 py-1 bg-white border border-brand-brown/5 rounded-full text-brand-brown/60 hover:text-brand-rose transition-colors shadow-sm">
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 order-1 lg:order-2 space-y-8">
            <h2 className="text-5xl font-serif text-brand-brown">Nova <span className="text-brand-rose italic">Insights</span></h2>
            <div className="bg-brand-softPink p-6 rounded-[2rem] border-l-4 border-brand-rose">
              <p className="text-brand-brown/80 text-sm italic leading-relaxed">
                "{prediction.explanation}"
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-brand-rose text-white p-6 rounded-[2.5rem] text-center shadow-lg shadow-brand-rose/10">
                <h4 className="text-3xl font-serif font-bold">{(prediction.estimatedUsers / 1000).toFixed(1)}k</h4>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Traffic</p>
              </div>
              <div className="bg-white border border-brand-brown/10 p-6 rounded-[2.5rem] text-center soft-shadow">
                <h4 className="text-3xl font-serif font-bold text-brand-brown">{prediction.recommendedPods}</h4>
                <p className="text-[10px] uppercase font-bold tracking-widest text-brand-rose/60">Pods</p>
              </div>
              <div className="bg-white border border-brand-brown/10 p-6 rounded-[2.5rem] text-center soft-shadow">
                <h4 className="text-3xl font-serif font-bold text-brand-brown">{(prediction.confidence * 100).toFixed(0)}%</h4>
                <p className="text-[10px] uppercase font-bold tracking-widest text-brand-rose/60">Certainty</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Expertise Section */}
      <section className="flex flex-col lg:flex-row items-center gap-16 pb-20 animate-fadeIn">
        <div className="lg:w-1/2 space-y-10">
          <h2 className="text-4xl font-serif text-brand-brown">The <span className="text-brand-rose italic">Nova Guarantee</span></h2>
          <p className="text-brand-brown/60 text-sm leading-relaxed">
            Our AI doesn't just look at logs; it looks at the world. By grounding its analysis in real-time search data, Nova AI anticipates viral spikes and marketing surges before they hit your nodes.
          </p>

          <div className="space-y-6">
            {[
              { label: 'Forecast Accuracy', val: 94 },
              { label: 'Latency Reduction', val: 88 },
              { label: 'Resource Utilization', val: 82 }
            ].map((bar, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-rose/60">
                  <span>{bar.label}</span>
                  <span>{bar.val}%</span>
                </div>
                <div className="w-full bg-brand-softPink rounded-full h-1.5 overflow-hidden border border-brand-brown/5">
                  <div className="bg-brand-rose h-full transition-all duration-1000" style={{ width: `${bar.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-sm">
            <div className="aspect-[4/5] bg-white organic-arches overflow-hidden soft-shadow tape-effect border border-brand-brown/5">
              <div className="w-full h-full bg-gradient-to-tr from-brand-rose/5 to-white flex items-end p-12">
                <div className="text-left space-y-2">
                  <span className="text-brand-rose text-xs font-bold tracking-widest uppercase">Nova-Verified Protocol</span>
                  <h4 className="text-2xl font-serif text-brand-brown font-bold italic">Nova AI Reliability</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OverviewTab;
