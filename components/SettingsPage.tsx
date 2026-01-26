
import React from 'react';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, onThemeChange }) => {
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

        <div className="border-t border-brand-brown/5 pt-8">
          <h3 className="font-bold text-brand-brown mb-6 uppercase text-[10px] tracking-widest text-brand-rose">User Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown/30 ml-4 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                defaultValue="SRE Engineer" 
                className="w-full px-6 py-4 bg-brand-softPink border border-transparent focus:border-brand-rose/20 rounded-full text-sm text-brand-brown focus:outline-none focus:ring-4 focus:ring-brand-rose/5 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown/30 ml-4 uppercase tracking-widest">Email</label>
              <input 
                type="email" 
                defaultValue="admin@kubescale.ai" 
                className="w-full px-6 py-4 bg-brand-softPink border border-transparent focus:border-brand-rose/20 rounded-full text-sm text-brand-brown focus:outline-none focus:ring-4 focus:ring-brand-rose/5 transition-all" 
              />
            </div>
          </div>
        </div>

        <div className="border-t border-brand-brown/5 pt-8">
           <button className="bg-brand-rose text-white px-10 py-4 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-rose/10">
             Save Changes
           </button>
        </div>
      </section>
    </main>
  );
};

export default SettingsPage;