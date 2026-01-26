
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-beige p-6 relative overflow-hidden">
      {/* Aesthetic Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-rose/5 organic-arches -mr-64 -mt-32 blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-accent/10 rounded-full -ml-32 -mb-32 blur-[100px]"></div>

      <div className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl border border-white relative z-10 text-center space-y-10">
        <div className="space-y-4">
          <div className="text-brand-rose text-3xl">✦</div>
          <h1 className="text-4xl font-serif text-brand-brown font-bold italic">Welcome Back</h1>
          <p className="text-brand-brown/50 text-sm">Access your aesthetic scaling engine.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-widest ml-6">Admin Key</label>
            <input 
              type="email" 
              placeholder="admin@kubescale.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-8 py-5 bg-brand-softPink border border-transparent focus:border-brand-rose/20 rounded-full focus:outline-none focus:ring-4 focus:ring-brand-rose/5 transition-all text-brand-brown placeholder:text-brand-brown/20"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-widest ml-6">Passcode</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-8 py-5 bg-brand-softPink border border-transparent focus:border-brand-rose/20 rounded-full focus:outline-none focus:ring-4 focus:ring-brand-rose/5 transition-all text-brand-brown placeholder:text-brand-brown/20"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-brand-rose text-white font-bold rounded-full shadow-xl shadow-brand-rose/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Enter Engine
          </button>
        </form>

        <div className="text-[10px] font-bold text-brand-brown/30 uppercase tracking-[0.2em]">
          Powered by Gemini Intelligence
        </div>
      </div>
    </div>
  );
};

export default LoginPage;