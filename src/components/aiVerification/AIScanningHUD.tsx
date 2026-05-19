import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, ShieldCheck, Loader2, Sparkles, 
  Layers, Search, ShieldAlert, Cpu
} from 'lucide-react';
import { useVerificationStore } from '../../store/verificationStore';
import type { ScanningStep } from '../../store/verificationStore';

interface AIScanningHUDProps {
  fileName: string;
  fileSize: string;
  onScanComplete: () => void;
}

export const AIScanningHUD: React.FC<AIScanningHUDProps> = ({
  fileName,
  fileSize,
  onScanComplete
}) => {
  const { isScanning, scanningStep, setScanning } = useVerificationStore();
  const [progress, setProgress] = useState(0);

  // Replicate AI verification timeline
  useEffect(() => {
    if (!isScanning) return;

    setProgress(0);
    const steps: { step: ScanningStep; duration: number }[] = [
      { step: 'OCR Text Extracting', duration: 1000 },
      { step: 'Format Validating', duration: 1200 },
      { step: 'Duplicate Database Checking', duration: 1000 },
      { step: 'Fraud Signature Auditing', duration: 1000 },
    ];

    let currentStepIndex = 0;
    
    // Ticker progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 42);

    const runSteps = async () => {
      for (const item of steps) {
        setScanning(true, item.step);
        await new Promise(resolve => setTimeout(resolve, item.duration));
      }
      setScanning(true, 'Complete');
      await new Promise(resolve => setTimeout(resolve, 300));
      setScanning(false, 'Idle');
      onScanComplete();
    };

    runSteps();

    return () => {
      clearInterval(progressInterval);
    };
  }, [isScanning]);

  if (!isScanning) return null;

  const getStepIcon = (step: ScanningStep) => {
    switch (step) {
      case 'OCR Text Extracting':
        return <FileText className="text-indigo-400 animate-pulse" size={18} />;
      case 'Format Validating':
        return <Layers className="text-amber-400" size={18} />;
      case 'Duplicate Database Checking':
        return <Search className="text-blue-400" size={18} />;
      case 'Fraud Signature Auditing':
        return <ShieldAlert className="text-rose-500 animate-bounce" size={18} />;
      default:
        return <Sparkles className="text-emerald-400 animate-spin" size={18} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full relative overflow-hidden"
        >
          {/* Laser Scanning Effect Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none">
            <motion.div 
              animate={{ 
                y: [0, 480, 0] 
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#6366f1] z-10"
            />
          </div>

          <div className="flex flex-col items-center space-y-6 relative z-20">
            {/* AI HUD Logo Core */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Cpu className="text-indigo-400 animate-spin-slow" size={32} />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="text-center space-y-1 w-full">
              <h3 className="text-lg font-bold text-white tracking-wide">OCR AI Document Verification</h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[320px] mx-auto">Scanning: {fileName} ({fileSize})</p>
            </div>

            {/* Circular Progress Indicator */}
            <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">STAGE ANALYSIS RUNNING</span>
                <span className="text-indigo-400 font-bold">{progress}% DONE</span>
              </div>
              <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Steps Timeline Checklist */}
            <div className="w-full space-y-3 pt-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <Layers size={11} className="text-indigo-500" /> Pipeline Auditing Threads
              </p>
              
              <div className="space-y-2">
                {[
                  { step: 'OCR Text Extracting', label: 'OCR Document Layout Parsing' },
                  { step: 'Format Validating', label: 'Tax ID Format Check (PAN/GSTIN)' },
                  { step: 'Duplicate Database Checking', label: 'Logistics Access Control Duplicates Auditing' },
                  { step: 'Fraud Signature Auditing', label: 'Security Forgery Template Matching' },
                ].map((item, idx) => {
                  const isCurrent = scanningStep === item.step;
                  const isDone = progress > (idx + 1) * 22; // Quick approximation for checkmark flips

                  return (
                    <motion.div 
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                        isCurrent 
                          ? 'bg-indigo-950/20 border-indigo-800 text-slate-200' 
                          : isDone 
                            ? 'bg-slate-950/30 border-slate-900 text-slate-400'
                            : 'bg-slate-950/10 border-transparent text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {isCurrent ? (
                            <Loader2 className="animate-spin text-indigo-400" size={14} />
                          ) : isDone ? (
                            <ShieldCheck className="text-emerald-500" size={14} />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                          )}
                        </div>
                        <span className="text-xs font-medium font-sans">{item.label}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[8px] font-mono font-bold bg-indigo-950 border border-indigo-800 text-indigo-300 px-1 rounded uppercase tracking-wider animate-pulse">
                          Active
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* AI Warning Disclaimers */}
            <div className="text-[9px] text-slate-500 italic text-center leading-relaxed">
              * Verification simulates character recognition models and compliance registers before staging Approved partners.
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
