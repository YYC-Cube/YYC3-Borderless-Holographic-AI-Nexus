import { Button } from '@/components/ui/button';
import { CheckCircle, EyeOff, Key, Lock, Shield, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SecurityModuleProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecurityModule({ isOpen, onClose }: SecurityModuleProps) {
  const [privacyMode, setPrivacyMode] = useState(false);
  const [encryptionLevel, setEncryptionLevel] = useState<'standard' | 'quantum'>('standard');
  const [secId] = useState(() => Math.floor(Math.random() * 10000));

  const togglePrivacy = () => {
    setPrivacyMode(!privacyMode);
    toast(privacyMode ? "PRIVACY SHIELD DISENGAGED" : "PRIVACY SHIELD ENGAGED", {
      icon: privacyMode ? <EyeOff className="w-4 h-4" /> : <Shield className="w-4 h-4 text-emerald-400" />
    });
  };

  const clearSensitiveData = () => {
    toast.success("LOCAL CACHE PURGED", { description: "Sensitive memory fragments removed." });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="w-full max-w-md bg-[#050a14] border border-blue-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.2)]">
            {/* Header */}
            <div className="p-6 border-b border-blue-500/20 bg-blue-950/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-mono text-blue-100 tracking-wider">SECURITY_LAYER</h2>
                  <p className="text-[10px] text-blue-400/60 font-mono">STATUS: {privacyMode ? 'ENFORCED' : 'MONITORING'}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-blue-400/50 hover:text-blue-300 hover:bg-blue-500/10">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-900/10 rounded-xl border border-blue-500/10">
                <div className="flex items-center gap-3">
                  <EyeOff className={`w-5 h-5 ${privacyMode ? 'text-emerald-400' : 'text-blue-400/50'}`} />
                  <div>
                    <div className="text-sm text-blue-100 font-medium">Incognito Protocol</div>
                    <div className="text-[10px] text-blue-400/50">Prevent local logging of session data</div>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${privacyMode ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-blue-950 border border-blue-500/20'}`}
                  onClick={togglePrivacy}
                >
                  <motion.div
                    className={`w-4 h-4 rounded-full ${privacyMode ? 'bg-emerald-400' : 'bg-blue-600'}`}
                    animate={{ x: privacyMode ? 24 : 0 }}
                  />
                </div>
              </div>

              {/* Data Purge */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-blue-500 uppercase tracking-widest">Data Sanitization</h3>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 h-12"
                  onClick={clearSensitiveData}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge Session Cache</span>
                </Button>
              </div>

              {/* Encryption Visual */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-blue-500 uppercase tracking-widest">Encryption Standards</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${encryptionLevel === 'standard' ? 'bg-blue-500/20 border-blue-400 text-blue-100' : 'bg-transparent border-blue-500/10 text-blue-500/50'}`}
                    onClick={() => setEncryptionLevel('standard')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-3 h-3" />
                      <span className="text-xs font-bold">AES-256</span>
                    </div>
                    <div className="text-[9px] opacity-70">Standard military grade protection.</div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${encryptionLevel === 'quantum' ? 'bg-purple-500/20 border-purple-400 text-purple-100' : 'bg-transparent border-blue-500/10 text-blue-500/50'}`}
                    onClick={() => setEncryptionLevel('quantum')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Key className="w-3 h-3" />
                      <span className="text-xs font-bold">QUANTUM</span>
                    </div>
                    <div className="text-[9px] opacity-70">Post-quantum lattice cryptography.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Status */}
            <div className="p-3 bg-black/40 border-t border-blue-500/10 flex justify-between items-center px-6">
              <span className="text-[9px] font-mono text-blue-500/40">ID: SEC-{secId}</span>
              <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500/80">
                <CheckCircle className="w-3 h-3" />
                SYSTEM SECURE
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
