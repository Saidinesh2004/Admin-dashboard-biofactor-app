import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { useTransporterStore } from '@/store/transporterStore';
import { useOnboardingStore } from '@/store/onboardingStore';

export const LoginPage: React.FC = () => {
  const { login } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('dinesh.kumar@biofactor.in');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate backend credentials verification (800ms delay)
    setTimeout(() => {
      setIsLoading(false);
      
      // 1. Check default admin credentials
      if (email === 'dinesh.kumar@biofactor.in' && (password === 'admin123' || password === '••••••••')) {
        login('mock_jwt_token_biofactor_superadmin');
        toast({
          title: "Access Granted",
          description: "Welcome back, Dinesh Kumar. Session established successfully.",
        });
        navigate('/');
        return;
      }

      // 2. Check transporters/drivers in store
      const transporters = useTransporterStore.getState().transporters;
      const matchTransporter = transporters.find(
        t => t.email.toLowerCase() === email.toLowerCase() && t.password === password
      );

      if (matchTransporter) {
        login(`mock_jwt_token_${matchTransporter.id}`);
        toast({
          title: "Access Granted",
          description: `Welcome back, ${matchTransporter.ownerName} (${matchTransporter.role || 'Transporter'}). Session established.`,
        });
        navigate('/');
        return;
      }

      // 3. Check onboarding queue (unapproved/pending accounts)
      const queue = useOnboardingStore.getState().onboardingQueue;
      const matchQueue = queue.find(
        q => q.data.email.toLowerCase() === email.toLowerCase() && q.data.password === password
      );

      if (matchQueue) {
        login(`mock_jwt_token_${matchQueue.id}`);
        toast({
          title: "Access Granted",
          description: `Welcome back, ${matchQueue.data.ownerName} (${matchQueue.data.role || 'User'}). Session established.`,
        });
        navigate('/');
        return;
      }

      // If no matching account found, show error
      toast({
        title: "Access Denied",
        description: "Invalid email or password. Please verify the credentials extracted from your Excel spreadsheet.",
        variant: "destructive"
      });
    }, 850);
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-800/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.7 }}
        className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl space-y-8 relative z-10"
      >
        {/* Brand / Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-emerald-500/20">
            B
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Biofactor Logistics</h2>
            <p className="text-xs text-emerald-400 mt-1 uppercase font-semibold tracking-wider">Enterprise ERP Gateway</p>
          </div>
        </div>

        {/* Informative Alert for quick demo */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-2.5 items-start">
          <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={16} />
          <div className="text-left">
            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">ERP Demo Access</p>
            <p className="text-[10px] text-emerald-200 mt-0.5">Use the prefilled administrator credentials to log back in instantly.</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white/5 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-white rounded-xl outline-none transition-all placeholder:text-gray-500"
                placeholder="admin@biofactor.in"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white/5 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-white rounded-xl outline-none transition-all placeholder:text-gray-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Verifying Credentials...
              </>
            ) : (
              <>
                Secure Login
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-[10px] text-emerald-500/70 text-center">
          © {new Date().getFullYear()} Biofactor Agri-Sciences. All Administrative Actions are Audited.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
