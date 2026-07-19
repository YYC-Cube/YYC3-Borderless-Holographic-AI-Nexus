import { Button } from '@/components/ui/button';
import { GestureContainer } from '@/components/ui/GestureContainer';
import { useTranslation } from '@/src/i18n';
import { GenerationRequest, GeneratorMode } from '@/types';
import { dispatchGeneration, GenerationResult } from '@/utils/generation';
import { DEFAULT_CONFIG, generateCompletion, MessageContent } from '@/utils/llm';
import { validateGenerationRequest } from '@/utils/validation';
import { ArrowLeft, Download, Image as ImageIcon, Music, Network, RefreshCw, Settings2, Share2, Sparkles, Type, Video, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
const bgImage = "/Family-AI-001.png";

interface AIGeneratorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSwitcher?: () => void;
}

export function AIGeneratorPanel({ isOpen, onClose, onShowSwitcher }: AIGeneratorPanelProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<GeneratorMode>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [generatedText, setGeneratedText] = useState<string>('');

  const handleGenerate = async () => {
    const request: GenerationRequest = {
      mode,
      prompt
    };

    const validation = validateGenerationRequest(request);

    if (!validation.valid) {
      toast.error(t('generator.validationFailed'), { description: validation.error });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setGeneratedText('');

    try {
      if (mode === 'text') {
        // Real API call for text generation
        const messages: MessageContent[] = [
          { role: 'user', content: prompt }
        ];

        const response = await generateCompletion(messages, DEFAULT_CONFIG);
        setGeneratedText(response);
        setResult({ success: true, mimeType: 'text/plain' });
        toast.success(t('generator.generationComplete'), {
          description: t('generator.llmResponseGenerated')
        });
      } else if (mode === 'image' || mode === 'video' || mode === 'audio') {
        // Real API call via dispatchGeneration
        const genResult = await dispatchGeneration(request, DEFAULT_CONFIG);

        if (genResult.success) {
          setResult(genResult);
          toast.success(t('generator.generationComplete'), {
            description: `${mode.toUpperCase()} ${t('generator.artifactCreated')}`
          });
        } else {
          // Fallback: show placeholder on API failure
          setResult(genResult);
          toast.warning(t('generator.generationDegraded'), {
            description: genResult.error || t('generator.apiUnavailable')
          });
        }
      }
    } catch (_error) {
      toast.error(t('generator.generationFailed'), {
        description: t('generator.apiConnectionFailed')
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'text': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'image': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'audio': return 'text-pink-400 border-pink-500/30 bg-pink-500/10';
      case 'video': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    }
  };

  const renderResult = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 opacity-80">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-20 animate-pulse" />
            <Sparkles className="w-12 h-12 animate-spin text-yellow-400 relative z-10" />
          </div>
          <div className="text-center">
            <p className="font-mono text-sm text-yellow-100 font-bold tracking-widest">{t('generator.neuralProcessing')}</p>
            <p className="font-mono text-[10px] text-yellow-500/50 mt-1">{t('generator.allocatingTensors')}</p>
          </div>
        </div>
      );
    }

    if (result) {
      return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
          <div className="flex-1 bg-black/40 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center relative group">
            {mode === 'text' && (
              <div className="p-8 text-left font-mono text-sm leading-relaxed text-gray-300 w-full h-full overflow-y-auto custom-scrollbar">
                <span className="text-blue-400 block mb-4">// {t('generator.generatedOutput')}</span>
                {generatedText || t('generator.mockResponse', { prompt })}
              </div>
            )}
            {mode === 'image' && (
              <div className="w-full h-full flex items-center justify-center relative">
                {result.data ? (
                  <img
                    src={result.data.startsWith('http') ? result.data : `data:${result.mimeType || 'image/png'};base64,${result.data}`}
                    alt="Generated"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <>
                    <ImageIcon className="w-24 h-24 text-purple-500/20" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    {result.error && (
                      <p className="absolute bottom-4 text-[10px] text-red-400/50 font-mono">{result.error.slice(0, 80)}</p>
                    )}
                  </>
                )}
              </div>
            )}
            {mode === 'audio' && (
              <div className="w-full h-full flex items-center justify-center relative">
                {result.data ? (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <div className="w-16 h-16 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                      <Music className="w-8 h-8 text-pink-400" />
                    </div>
                    <audio controls className="w-64" src={`data:${result.mimeType || 'audio/mp3'};base64,${result.data}`}>
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                ) : (
                  <>
                    <Music className="w-24 h-24 text-pink-500/20" />
                    {result.error && (
                      <p className="absolute bottom-4 text-[10px] text-red-400/50 font-mono">{result.error.slice(0, 80)}</p>
                    )}
                  </>
                )}
              </div>
            )}
            {mode === 'video' && (
              <div className="w-full h-full flex items-center justify-center relative">
                {result.data ? (
                  <video
                    controls
                    className="w-full h-full object-contain"
                    src={result.data.startsWith('http') ? result.data : `data:${result.mimeType || 'video/mp4'};base64,${result.data}`}
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <>
                    <Video className="w-24 h-24 text-orange-500/20" />
                    <div className="absolute bottom-8 left-8 right-8 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[45%] h-full bg-orange-500" />
                    </div>
                    {result.error && (
                      <p className="absolute bottom-4 text-[10px] text-red-400/50 font-mono">{result.error.slice(0, 80)}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {result.data && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10 text-white"><Download className="w-5 h-5" /></Button>
                <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10 text-white"><Share2 className="w-5 h-5" /></Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30">
        <div className="p-6 rounded-full bg-white/5 border border-white/5">
          <Network className="w-12 h-12" />
        </div>
        <p className="font-mono text-xs tracking-widest">{t('generator.awaiting')}</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            <img src={bgImage} alt="Background" className="w-full h-full object-cover grayscale brightness-50 contrast-125" />
            <div className="absolute inset-0 bg-linear-to-t from-[#050a10] via-[#050a10]/80 to-transparent" />
          </div>

          <GestureContainer
            onClose={onClose}
            onMenu={() => onShowSwitcher && onShowSwitcher()}
            className="relative z-10 w-full h-full md:max-w-7xl md:h-[90vh] flex items-center justify-center p-2 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full bg-[#050a10]/60 border border-yellow-500/20 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(234,179,8,0.1)] flex flex-col md:flex-row pointer-events-auto relative"
            >
              {/* Decoration Lines */}
              <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-yellow-500/50 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-yellow-500/50 to-transparent" />

              {/* Sidebar */}
              <div className="w-full md:w-72 bg-black/40 border-r border-white/5 p-4 flex flex-col gap-2 relative z-10">
                <div className="mb-8 px-2 pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                      <Network className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-widest text-white">{t('generator.studio')}</h2>
                      <p className="text-[9px] font-mono text-yellow-500/60 uppercase tracking-wider">Generative_AI_Suite</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {[{ id: 'text', label: t('generator.text'), icon: Type, desc: t('generator.descText') },
                  { id: 'image', label: t('generator.image'), icon: ImageIcon, desc: t('generator.descImage') },
                  { id: 'audio', label: t('generator.audio'), icon: Music, desc: t('generator.descAudio') },
                  { id: 'video', label: t('generator.video'), icon: Video, desc: t('generator.descVideo') },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMode(item.id as GeneratorMode)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono transition-all group relative overflow-hidden ${mode === item.id
                        ? 'bg-yellow-500/10 text-white border border-yellow-500/30'
                        : 'text-gray-400 border border-transparent hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <item.icon className={`w-4 h-4 ${mode === item.id ? 'text-yellow-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                      <div className="text-left flex-1">
                        <div className="font-bold flex justify-between items-center">
                          {item.label}
                        </div>
                        <div className="text-[9px] opacity-50 font-sans normal-case">{item.desc}</div>
                      </div>
                      {mode === item.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-500" />}
                    </button>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-white/5">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-gray-500 font-mono">{t('generator.credits')}</span>
                      <span className="text-[10px] text-yellow-400 font-mono">850 / 1000</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-[85%]" />
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500 text-xs font-mono hover:text-white hover:bg-white/5" onClick={onClose}>
                    <ArrowLeft className="w-4 h-4" /> {t('generator.returnHome')}
                  </Button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050a10]/40">
                {/* Top Bar */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest border ${getModeColor()}`}>
                      {t('generator.model')}: {mode === 'text' ? 'GPT-4o' : mode === 'image' ? 'FLUX-PRO' : mode === 'audio' ? 'ELEVEN-LABS' : 'RUNWAY-GEN2'}
                    </span>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t('generator.ready')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"><Settings2 className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg" onClick={onClose}><X className="w-4 h-4" /></Button>
                  </div>
                </div>

                {/* Workspace */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                  {/* Input Area */}
                  <div className="w-full lg:w-[400px] border-r border-white/5 p-6 flex flex-col gap-6 bg-black/10">
                    <div className="flex-1">
                      <label className="text-[10px] font-mono text-gray-500 mb-2 block uppercase tracking-wider flex justify-between">
                        <span>{t('generator.promptInput')}</span>
                        <span className="text-white/20">CTRL+ENTER</span>
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-full min-h-[200px] bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-200 font-sans focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none resize-none transition-all placeholder:text-white/10 leading-relaxed"
                        placeholder={mode === 'text' ? t('generator.placeholderText') : mode === 'image' ? t('generator.placeholderImage') : mode === 'audio' ? t('generator.placeholderAudio') : t('generator.placeholderVideo')}
                      />
                    </div>

                    {/* Params */}
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4">
                      <label className="text-[10px] font-mono text-gray-500 block uppercase tracking-wider">{t('generator.params')}</label>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                          <span>{t('generator.guidanceScale')}</span>
                          <span className="text-yellow-500">7.5</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-[60%] h-full bg-yellow-500/50" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                          <span>{t('generator.steps')}</span>
                          <span className="text-yellow-500">30</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-[40%] h-full bg-yellow-500/50" />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className={`w-full py-6 font-mono tracking-widest text-black font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] ${mode === 'text' ? 'bg-blue-400' :
                        mode === 'image' ? 'bg-purple-400' :
                          mode === 'audio' ? 'bg-pink-400' : 'bg-orange-400'
                        }`}
                    >
                      {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      {isGenerating ? t('generator.generating') : t('generator.generate')}
                    </Button>
                  </div>

                  {/* Preview Area */}
                  <div className="flex-1 p-6 relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                    <div className="h-full border border-white/10 rounded-2xl bg-black/20 overflow-hidden relative shadow-inner">
                      {renderResult()}

                      {/* Grid overlay */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </GestureContainer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
