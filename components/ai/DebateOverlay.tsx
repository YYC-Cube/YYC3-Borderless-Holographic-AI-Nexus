import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/src/i18n';
import { CharacterProfile, PRESET_CHARACTERS } from '@/utils/character';
import { generateCompletion, LLMConfig, MessageContent } from '@/utils/llm';
import { Play, Square, Users, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface DebateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  mainConfig: LLMConfig;
  onSpeak: (text: string, config: LLMConfig) => void;
  onStatusChange: (status: 'idle' | 'processing' | 'speaking') => void;
  initialTopic?: string;
}

interface DebateMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  color: string;
}

export function DebateOverlay({ isOpen, onClose, mainConfig, onSpeak, onStatusChange, initialTopic }: DebateOverlayProps) {
  const { t } = useTranslation();
  const [charA, setCharA] = useState<CharacterProfile>(PRESET_CHARACTERS[1]);
  const [charB, setCharB] = useState<CharacterProfile>(PRESET_CHARACTERS[2]); // HAL
  const [topic, setTopic] = useState(initialTopic || '');
  const [isDebating, setIsDebating] = useState(false);
  const [transcript, setTranscript] = useState<DebateMessage[]>([]);
  const [_round, setRound] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debateLoopRef = useRef<boolean>(false);

  const stopDebate = () => {
    debateLoopRef.current = false;
    setIsDebating(false);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    onStatusChange('idle');
  };

  // Stop debate when closing
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      stopDebate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const runDebateTurn = async (activeChar: CharacterProfile, opponentChar: CharacterProfile, history: DebateMessage[]) => {
    if (!debateLoopRef.current) return;

    onStatusChange('processing');

    // Construct Prompt
    const systemPrompt = `
        ${activeChar.systemPrompt}

        ${t('debate.systemPrompt', { opponent: opponentChar.name, topic })}
        `;

    const messages: MessageContent[] = history.slice(-6).map(m => ({
      role: m.senderId === activeChar.id ? 'assistant' : 'user',
      content: m.content
    }));

    // Initial turn needs context
    if (messages.length === 0) {
      messages.push({ role: 'user', content: t('debate.openPrompt', { topic }) });
    }

    // Use a temporary config for this character
    const charConfig: LLMConfig = {
      ...mainConfig,
      systemPrompt: systemPrompt,
      // We strictly use the character's TTS settings
      ttsProvider: activeChar.ttsConfig.provider,
      ttsVoice: activeChar.ttsConfig.voice,
      ttsSpeed: activeChar.ttsConfig.speed
    };

    try {
      const response = await generateCompletion(messages, charConfig);

      if (!debateLoopRef.current) return;

      // Add to transcript
      const newMessage: DebateMessage = {
        // eslint-disable-next-line react-hooks/purity
        id: Date.now().toString(),
        senderId: activeChar.id,
        senderName: activeChar.name,
        content: response,
        color: activeChar.themeColor === 'red' ? 'text-red-400' : 'text-cyan-400'
      };

      setTranscript(prev => [...prev, newMessage]);

      // Speak
      onStatusChange('speaking');
      // We need to wait for speech to finish roughly.
      // Since onSpeak is fire-and-forget in current architecture, we approximate or assume logic.
      // *Crucial*: In a real app we'd need an onSpeechEnd callback for the debate loop.
      // For this prototype, we'll wait based on text length estimation + TTS call.

      onSpeak(response, charConfig);

      // Estimate duration: 200ms per char + 2s buffer
      const estimatedDuration = (response.length * 200) + 2000;
      await new Promise(r => setTimeout(r, estimatedDuration));

      // Next Turn
      if (debateLoopRef.current) {
        setRound(r => r + 1);
        // Recursive call for opponent
        runDebateTurn(opponentChar, activeChar, [...history, newMessage]);
      }

    } catch (e) {
      console.error("Debate Error:", e);
      stopDebate();
    }
  };

  const startDebate = () => {
    if (!topic.trim()) return;
    setIsDebating(true);
    setTranscript([]);
    setRound(1);
    debateLoopRef.current = true;

    // Start with Char A
    runDebateTurn(charA, charB, []);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="w-full max-w-4xl h-[80vh] bg-[#0f172a] border border-cyan-500/30 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-900/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-linear-to-r from-cyan-900/20 to-purple-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">{t('debate.title')}</h2>
                  <p className="text-xs text-cyan-500/60 uppercase tracking-widest">{t('debate.subtitle')}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Setup */}
              <div className="w-1/3 p-6 border-r border-white/5 flex flex-col gap-6 bg-black/20">
                <div className="space-y-4">
                  <label className="text-xs text-cyan-500 font-mono uppercase">{t('debate.proponent')}</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-cyan-500 outline-none"
                    value={charA.id}
                    onChange={e => setCharA(PRESET_CHARACTERS.find(c => c.id === e.target.value) || charA)}
                    disabled={isDebating}
                  >
                    {PRESET_CHARACTERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="flex justify-center items-center">
                  <div className="w-[1px] h-8 bg-white/10"></div>
                  <div className="px-3 text-xs text-gray-500 font-mono">VS</div>
                  <div className="w-[1px] h-8 bg-white/10"></div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs text-red-500 font-mono uppercase">{t('debate.opponent')}</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-500 outline-none"
                    value={charB.id}
                    onChange={e => setCharB(PRESET_CHARACTERS.find(c => c.id === e.target.value) || charB)}
                    disabled={isDebating}
                  >
                    {PRESET_CHARACTERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="text-xs text-purple-500 font-mono uppercase">{t('debate.topic')}</label>
                  <Input
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder={t('debate.topicPlaceholder')}
                    className="bg-white/5 border-white/10 text-white"
                    disabled={isDebating}
                  />
                </div>

                <div className="mt-auto">
                  {!isDebating ? (
                    <Button
                      onClick={startDebate}
                      disabled={!topic.trim()}
                      className="w-full bg-linear-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold h-12 shadow-lg shadow-purple-900/20"
                    >
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      {t('debate.start')}
                    </Button>
                  ) : (
                    <Button
                      onClick={stopDebate}
                      variant="destructive"
                      className="w-full h-12 bg-red-900/50 hover:bg-red-900/80 text-red-200 border border-red-500/20"
                    >
                      <Square className="w-4 h-4 mr-2 fill-current" />
                      {t('debate.stop')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Right: Transcript */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth bg-linear-to-br from-[#0f172a] to-[#05080f]">
                {transcript.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
                    <Zap className="w-16 h-16 opacity-20" />
                    <p className="text-sm font-light tracking-widest">{t('debate.idle')}</p>
                  </div>
                )}
                {transcript.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.senderId === charA.id ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex flex-col gap-2 max-w-[90%] ${msg.senderId === charA.id ? 'self-start items-start' : 'self-end items-end'}`}
                  >
                    <div className="flex items-center gap-2 text-xs opacity-50 px-1">
                      <span className={msg.color}>{msg.senderName}</span>
                      <span>•</span>
                      <span className="font-mono">{new Date(parseInt(msg.id)).toLocaleTimeString()}</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm ${msg.senderId === charA.id
                      ? 'bg-cyan-950/40 border border-cyan-500/20 text-cyan-50 rounded-tl-none'
                      : 'bg-red-950/40 border border-red-500/20 text-red-50 rounded-tr-none'
                      }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isDebating && (
                  <div className="flex justify-center pt-4">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full bg-white/20"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
