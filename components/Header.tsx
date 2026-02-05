
import React from 'react';
import { AppView } from '../App';

interface HeaderProps {
  onNavigate: (view: AppView) => void;
  currentView: AppView;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, onLogout }) => {
  const tabs: { id: AppView; label: string }[] = [
    { id: 'overview', label: 'Home' },
    { id: 'tenants', label: 'Tenants' },
    { id: 'apps', label: 'Apps' },
    { id: 'deploy', label: 'Deploy' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'cost', label: 'Cost Analysis' },
    { id: 'events', label: 'Events' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-brown/5">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('overview')}>
          <div className="flex items-center gap-1">
            <span className="text-brand-rose text-2xl">✦</span>
            <span className="text-brand-brown font-serif text-3xl font-bold tracking-tight">KubeScale</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`text-sm font-bold transition-all duration-300 relative group ${currentView === tab.id ? 'text-brand-rose' : 'text-brand-brown/50 hover:text-brand-rose'
                }`}
            >
              {tab.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-rose transition-all duration-300 ${currentView === tab.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={onLogout}
            className="w-10 h-10 bg-brand-rose text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-rose/10 hover:scale-105 transition-all"
          >
            <div className="text-xs font-bold uppercase tracking-widest">M</div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;