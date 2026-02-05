
import React from 'react';
import { User } from '../types';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  user: User;
  isRealClusterMode: boolean;
  onToggleRealClusterMode: (value: boolean) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, onThemeChange, user, isRealClusterMode, onToggleRealClusterMode }) => {
  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold text-brand-brown mb-4">Account Settings</h1>
        <p className="text-brand-brown/50">Configure your KubeScale engine experience.</p>
      </div>

      <section className="bg-white rounded-[2rem] p-10 border border-brand-brown/5 soft-shadow space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-brand-brown">Appearance</h3>
            <p className="text-sm text-brand-brown/40 italic">System is optimized for clean White Minimalist theme.</p>
          </div>
          <div className="bg-brand-softPink p-1.5 rounded-full flex gap-1 border border-brand-brown/5">
            <button
              onClick={() => onThemeChange('light')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all bg-brand-rose text-white shadow-lg shadow-brand-rose/10`}
            >
              Minimal White
            </button>
          </div>
        </div>


        <div className="flex items-center justify-between pt-8 border-t border-brand-brown/5">
          <div>
            <h3 className="font-bold text-brand-brown">Cluster Connection Mode</h3>
            <p className="text-sm text-brand-brown/40 italic">
              {isRealClusterMode ? 'Connected to local Kubernetes context via Backend API.' : 'Running in browser-based AI Simulation Mode.'}
            </p>
          </div>
          <div className="bg-brand-softPink p-1.5 rounded-full flex gap-1 border border-brand-brown/5">
            <button
              onClick={() => onToggleRealClusterMode(false)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${!isRealClusterMode ? 'bg-brand-rose text-white shadow-lg' : 'text-brand-brown/50 hover:text-brand-brown'}`}
            >
              Simulation
            </button>
            <button
              onClick={() => onToggleRealClusterMode(true)}
              disabled={user.role === 'viewer'}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${isRealClusterMode ? 'bg-brand-accent text-white shadow-lg' : 'text-brand-brown/50 hover:text-brand-brown'} ${user.role === 'viewer' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Real Cluster
            </button>
          </div>
        </div>

        <div className="border-t border-brand-brown/5 pt-8">
          <h3 className="font-bold text-brand-brown mb-6 uppercase text-[10px] tracking-widest text-brand-rose">User Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown/30 ml-4 uppercase tracking-widest">Organization ID</label>
              <input
                type="text"
                value={user.organizationId}
                disabled
                className="w-full px-6 py-4 bg-brand-softPink/50 border border-transparent rounded-full text-sm text-brand-brown/60 focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown/30 ml-4 uppercase tracking-widest">Role</label>
              <div className="px-6 py-4 bg-brand-softPink/50 rounded-full text-sm font-bold text-brand-rose uppercase">
                {user.role}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown/30 ml-4 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                defaultValue="SRE Engineer"
                disabled={user.role === 'viewer'}
                className={`w-full px-6 py-4 bg-brand-softPink border border-transparent focus:border-brand-rose/20 rounded-full text-sm text-brand-brown focus:outline-none focus:ring-4 focus:ring-brand-rose/5 transition-all ${user.role === 'viewer' ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown/30 ml-4 uppercase tracking-widest">Email</label>
              <input
                type="email"
                defaultValue={user.email}
                disabled
                className="w-full px-6 py-4 bg-brand-softPink/50 border border-transparent rounded-full text-sm text-brand-brown/60 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-brand-brown/5 pt-8 flex items-center justify-between">
          {user.role === 'viewer' && (
            <span className="text-xs text-brand-rose font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Read-Only Access
            </span>
          )}
          <button
            disabled={user.role === 'viewer'}
            className={`px-10 py-4 rounded-full font-bold text-sm transition-all shadow-xl ${user.role === 'viewer' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-brand-rose text-white hover:scale-105 active:scale-95 shadow-brand-rose/10'}`}
          >
            Save Changes
          </button>
        </div>
      </section >
    </main >
  );
};

export default SettingsPage;