import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Image as ImageIcon, Mic, Paperclip, Send, StopCircle, Terminal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, image?: string) => void;
  speechState: string;
  onStartListening: () => void;
  onStopListening: () => void;
  transcript: string;
  pendingImage: string | null;
  setPendingImage: (img: string | null) => void;
}

export function TerminalPanel({
  isOpen,
  onClose,
  onSubmit,
  speechState,
  onStartListening,
  onStopListening,
  transcript,
  pendingImage,
  setPendingImage
}: TerminalPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync transcript to input when listening updates
  useEffect(() => {
    if (speechState === 'listening' && transcript) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputValue(transcript);
    }
  }, [transcript, speechState]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPendingImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() && !pendingImage) return;

    // If purely image, allow sending without text (or add default text)
    const finalInput = inputValue.trim() || (pendingImage ? "Analyze this visual data." : "");

    onSubmit(finalInput, pendingImage || undefined);
    setInputValue('');
  };

  const isListening = speechState === 'listening';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute bottom-0 inset-x-0 z-50 flex flex-col pointer-events-auto"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            if (info.offset.y > 100) onClose();
          }}
        >
          {/* Glass Morphism Container */}
          <div className="bg-[#050a10]/95 backdrop-blur-xl border-t border-cyan-500/30 shadow-[0_-10px_40px_rgba(8,145,178,0.15)] pb-6 rounded-t-2xl overflow-hidden">

            {/* Header Bar */}
            <div className="flex justify-between items-center px-4 py-2 bg-linear-to-r from-cyan-950/50 to-transparent border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_lime]'}`} />
                <span className="text-[10px] font-mono text-cyan-200 tracking-widest uppercase">
                  {isListening ? 'AUDIO_MATRIX_ACTIVE' : 'TERMINAL_LINK_ESTABLISHED'}
                </span>
              </div>
              <div className="w-20 h-1 bg-white/10 rounded-full mx-auto" /> {/* Drag Handle */}
              <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-cyan-500/50 hover:text-cyan-400">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image Preview Area */}
              <AnimatePresence>
                {pendingImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative w-fit"
                  >
                    <div className="absolute -top-2 -right-2 z-10">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-5 w-5 rounded-full text-[10px]"
                        onClick={() => setPendingImage(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="p-1 border border-cyan-500/30 rounded-lg bg-cyan-900/20">
                      {pendingImage.startsWith('data:image') ? (
                        <img src={pendingImage} alt="Upload" className="h-20 rounded shadow-lg object-cover" />
                      ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-white/5 rounded">
                          <ImageIcon className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-cyan-500 mt-1">Checking visual buffer...</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-lg group-focus-within:bg-cyan-500/10 transition-colors" />

                <div className="relative flex items-end gap-2 bg-black/40 border border-white/10 rounded-xl p-2 focus-within:border-cyan-500/50 transition-colors">
                  {/* File Upload Trigger */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-950/30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  {/* Text Input */}
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isListening ? "Processing audio stream..." : "Enter command or directive..."}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-cyan-100 placeholder:text-cyan-900/50 font-mono h-10 py-2"
                    autoComplete="off"
                  />

                  {/* Voice Toggle */}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={`${isListening ? 'text-red-400 bg-red-900/20 animate-pulse' : 'text-cyan-500/50 hover:text-cyan-400'}`}
                    onClick={isListening ? onStopListening : onStartListening}
                  >
                    {isListening ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]"
                    disabled={!inputValue.trim() && !pendingImage}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>

              {/* Footer Info */}
              <div className="flex justify-between items-center px-1">
                <div className="text-[9px] font-mono text-cyan-500/30 flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  <span>YYC3_SHELL_V2.0</span>
                </div>
                {isListening && (
                  <div className="flex gap-1 items-end h-3">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-0.5 bg-red-500/50"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
