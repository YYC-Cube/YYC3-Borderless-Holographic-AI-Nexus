import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/src/i18n';
import { LLMConfig } from '@/types';
import { CharacterProfile, PRESET_CHARACTERS, applyCharacterToConfig } from '@/utils/character';
import { DEFAULT_SERVER_URL } from '@/utils/cloud';
import { DEFAULT_PRESETS, ModelPreset, createConfigFromPreset } from '@/utils/model-presets';
import { AlertTriangle, Box, Cloud, Code, Cpu, Database, Globe, Key, Laptop, MessageSquare, Moon, Palette, Plus, RefreshCw, Save, Search, Server, Settings, Sliders, Sparkles, Terminal, Users, Volume2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: LLMConfig;
  onSave: (config: LLMConfig) => void;
  visualTheme?: 'cube' | 'globe';
  onVisualThemeChange?: (theme: 'cube' | 'globe') => void;
}

// Enhanced Model Hints Library
const MODEL_HINTS: Record<string, string> = {
  'claude': 'Detected Anthropic Architecture. Optimization: XML-based prompting, Chain-of-Thought.',
  'gpt': 'Detected OpenAI Architecture. Optimization: Markdown formatting, clear instructions.',
  'deepseek': 'Detected DeepSeek Architecture. Optimization: Code-heavy reasoning, concise output.',
  'mistral': 'Detected Mistral Architecture. Optimization: Direct answers, no fluff.',
  'llama': 'Detected Meta Llama Architecture. Optimization: System prompt reinforcement.',
  'qwen': 'Detected Qwen (Tongyi) Architecture. Optimization: Chinese idiom understanding, multi-lingual context.',
  'glm': 'Detected Zhipu GLM Architecture. Optimization: Tool use, function calling, Chinese logic.',
  'moonshot': 'Detected Moonshot (Kimi). Optimization: Long context retrieval, file analysis.',
  'yi': 'Detected 01.AI Yi Architecture. Optimization: Creative writing, high fidelity roleplay.',
  'hunyuan': 'Detected Tencent Hunyuan. Optimization: Logical reasoning in Chinese.',
  'baichuan': 'Detected Baichuan. Optimization: Chinese cultural context.',
  'gemini': 'Detected Google Gemini. Optimization: Multi-turn reasoning.',
  'minimax': 'Detected MiniMax. Optimization: Roleplay and speech patterns.',
  'doubao': 'Detected Doubao (ByteDance). Optimization: Colloquial interactions.',
};

const ICON_MAP: Record<string, React.ElementType> = {
  Server, Box, Cpu, Sparkles, Moon, Code, Database, Globe, Laptop
};

const _openaiVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

export function ConfigPanel({ isOpen, onClose, config: initialConfig, onSave, visualTheme = 'cube', onVisualThemeChange }: ConfigPanelProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<LLMConfig>({
    ...initialConfig,
    syncServerUrl: initialConfig.syncServerUrl || DEFAULT_SERVER_URL,
    temperature: initialConfig.temperature || 0.7,
    topP: initialConfig.topP || 0.9,
    maxTokens: initialConfig.maxTokens || 2048,
  });
  const [activeTab, setActiveTab] = useState<'engine' | 'voice' | 'persona' | 'cloud' | 'appearance'>('engine');
  const [hint, setHint] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [presets, _setPresets] = useState<ModelPreset[]>(DEFAULT_PRESETS);

  const _ttsProviders = [
    { id: 'browser', name: 'Browser Native', desc: 'Offline, Zero Latency' },
    { id: 'openai', name: 'OpenAI TTS', desc: 'High-Fidelity, Token Cost' }
  ];

  // Auto-detect hints based on model name
  useEffect(() => {
    if (config.model) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsScanning(true);
      const timeout = setTimeout(() => {
        const lowerModel = config.model.toLowerCase();
        const key = Object.keys(MODEL_HINTS).find(k => lowerModel.includes(k));
        setHint(key ? MODEL_HINTS[key] : null);
        setIsScanning(false);
      }, 600);
      return () => clearTimeout(timeout);
    } else {
      setHint(null);
    }
  }, [config.model]);

  const handlePresetSelect = (preset: ModelPreset) => {
    const newConfig = createConfigFromPreset(preset, config);
    setConfig({ ...newConfig, temperature: config.temperature, topP: config.topP, maxTokens: config.maxTokens } as LLMConfig);
  };

  const handleCharacterSelect = (char: CharacterProfile) => {
    const updated = applyCharacterToConfig(char, config);
    setConfig({ ...config, ...updated });
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-3xl max-h-[85vh] bg-[#050a10]/60 border border-cyan-500/30 shadow-[0_0_50px_rgba(8,145,178,0.2)] relative flex flex-col rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/20 flex justify-between items-center bg-linear-to-r from-cyan-950/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  <Settings className="w-5 h-5 text-cyan-400 animate-[spin_10s_linear_infinite]" />
                </div>
                <div>
                  <h2 className="text-lg font-mono font-bold text-cyan-100 tracking-wider uppercase">{t('panel.title')}</h2>
                  <div className="text-[10px] text-cyan-500/60 font-mono">{t('panel.subtitle')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20">
                  <Save className="w-4 h-4" /> {t('panel.save')}
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 hover:text-white text-gray-400">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Sidebar & Content Layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Navigation */}
              <div className="w-56 bg-black/20 border-r border-white/5 p-4 space-y-2 hidden md:block shrink-0">
                {[
                  { id: 'engine', label: t('panel.tabs.engine'), icon: Cpu },
                  { id: 'voice', label: t('panel.tabs.voice'), icon: Volume2, error: true },
                  { id: 'persona', label: t('panel.tabs.persona'), icon: Users },
                  { id: 'cloud', label: t('panel.tabs.cloud'), icon: Cloud },
                  { id: 'appearance', label: t('panel.tabs.appearance'), icon: Palette }
                ].map(tab => (
                  <button
                    key={tab.id}
                    disabled={tab.error}
                    onClick={() => !tab.error && setActiveTab(tab.id as 'engine' | 'voice' | 'persona' | 'cloud' | 'appearance')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-xs font-mono transition-all ${activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : tab.error
                        ? 'text-red-500/50 cursor-not-allowed border border-red-500/10 bg-red-900/5'
                        : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.error && <span className="ml-auto text-[8px] bg-red-500/20 text-red-400 px-1 rounded animate-pulse">{t('panel.fault')}</span>}
                  </button>
                ))}

                <div className="pt-4 mt-4 border-t border-white/5">
                  <div className="px-3 text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">{t('panel.supportedArch')}</div>
                  <div className="px-3 flex flex-wrap gap-2 opacity-50">
                    {['GPT', 'GLM', 'Qwen', 'Yi', 'Llama'].map(t => (
                      <span key={t} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                {activeTab === 'engine' && (
                  <div className="space-y-8">
                    {/* Preset Library Grid */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs text-cyan-500 font-mono tracking-wider uppercase">
                        <Globe className="w-3 h-3" /> {t('panel.modelLibrary')}
                      </label>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {presets.map((preset) => {
                          const Icon = ICON_MAP[preset.iconName] || Globe;
                          const isActive = config.model === preset.model && config.provider === preset.provider;

                          return (
                            <button
                              key={preset.id}
                              onClick={() => handlePresetSelect(preset)}
                              className={`flex flex-col gap-2 p-3 rounded-xl border transition-all text-left group relative overflow-hidden h-full ${isActive
                                ? 'bg-cyan-900/20 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                }`}
                            >
                              <div className="flex justify-between items-start w-full z-10">
                                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />}
                              </div>
                              <div className="z-10 mt-auto pt-2">
                                <div className="font-bold text-xs font-mono truncate">{preset.name}</div>
                                <div className="text-[9px] opacity-50 font-mono mt-0.5 truncate">{preset.description}</div>
                              </div>
                            </button>
                          );
                        })}
                        {/* Custom Add Button - Visual Only for now */}
                        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/10 bg-white/5 text-gray-500 hover:text-white hover:border-white/20 transition-all">
                          <Plus className="w-5 h-5" />
                          <span className="text-[10px] font-mono">{t('panel.customModel')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Connection Params */}
                    <div className="p-5 rounded-xl border border-white/10 bg-black/20 space-y-5">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-cyan-500" />
                          <span className="text-xs font-mono text-cyan-100">{t('panel.connectionMatrix')}</span>
                        </div>
                        <div className="flex gap-2">
                          {config.provider === 'zhipu' && <span className="text-[9px] text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded bg-purple-500/10">BigModel Open Platform</span>}
                          {config.provider === 'ollama' && <span className="text-[9px] text-green-400 border border-green-500/30 px-2 py-0.5 rounded bg-green-500/10">Local Network</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-gray-500 font-mono">{t('panel.endpointUrl')}</span>
                          <Input
                            value={config.baseUrl}
                            onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                            className="bg-black/40 border-white/10 text-cyan-100 font-mono text-xs h-9 focus:border-cyan-500/50"
                            placeholder="https://api..."
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-gray-500 font-mono">{t('panel.targetModelId')}</span>
                          <div className="relative">
                            <Input
                              value={config.model}
                              onChange={(e) => setConfig({ ...config, model: e.target.value })}
                              className="bg-black/40 border-white/10 text-cyan-100 font-mono text-xs h-9 focus:border-cyan-500/50 pr-8"
                              placeholder="e.g. glm-4, moonshot-v1-8k"
                            />
                            {isScanning && <RefreshCw className="absolute right-2 top-2.5 w-4 h-4 text-cyan-500 animate-spin" />}
                          </div>
                        </div>
                      </div>

                      {config.provider !== 'ollama' && config.baseUrl !== 'http://localhost:1234/v1' && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-gray-500 font-mono">{t('panel.secretKey')}</span>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                            <Input
                              type="password"
                              value={config.apiKey}
                              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                              className="bg-black/40 border-white/10 text-cyan-100 font-mono text-xs h-9 pl-9 focus:border-cyan-500/50"
                              placeholder="sk-..."
                            />
                          </div>
                        </div>
                      )}

                      {/* Intelligent Hint System */}
                      <AnimatePresence>
                        {hint ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[10px] font-mono text-emerald-400 bg-emerald-900/10 border border-emerald-500/20 p-3 rounded flex items-start gap-3"
                          >
                            <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-bold mb-0.5">{t('panel.optimizationDetected')}</div>
                              <div className="opacity-80 leading-relaxed">{hint}</div>
                            </div>
                          </motion.div>
                        ) : (
                          config.model && !isScanning && (
                            <motion.div
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="text-[10px] font-mono text-gray-600 bg-white/5 border border-white/5 p-2 rounded flex items-center gap-2"
                            >
                              <Search className="w-3 h-3" />
                              <span>{t('panel.awaiting')}</span>
                            </motion.div>
                          )
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Hyper-Parameters Tuning */}
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-xs text-cyan-500 font-mono tracking-wider uppercase">
                        <Sliders className="w-3 h-3" /> {t('panel.paramTuning')}
                      </label>

                      <div className="grid grid-cols-2 gap-6 bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs font-mono text-gray-400">
                            <span>{t('panel.temperature')}</span>
                            <span className="text-cyan-400 bg-cyan-900/30 px-1.5 rounded">{config.temperature}</span>
                          </div>
                          <input
                            type="range" min="0" max="2" step="0.1"
                            value={config.temperature}
                            onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_cyan]"
                          />
                          <div className="flex justify-between text-[9px] text-gray-600 font-mono">
                            <span>{t('panel.precise')}</span>
                            <span>{t('panel.creative')}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-xs font-mono text-gray-400">
                            <span>Top P</span>
                            <span className="text-cyan-400 bg-cyan-900/30 px-1.5 rounded">{config.topP}</span>
                          </div>
                          <input
                            type="range" min="0" max="1" step="0.05"
                            value={config.topP}
                            onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_cyan]"
                          />
                          <div className="flex justify-between text-[9px] text-gray-600 font-mono">
                            <span>{t('panel.focused')}</span>
                            <span>{t('panel.diverse')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'voice' && (
                  <div className="space-y-6 flex flex-col items-center justify-center h-full">
                    <div className="relative mb-4">
                      <AlertTriangle className="w-16 h-16 text-red-500/50 animate-pulse" />
                      <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                    </div>
                    <div className="text-center space-y-2 max-w-xs">
                      <h3 className="text-lg font-mono text-red-400 font-bold">{t('panel.systemFault')}</h3>
                      <div className="text-xs font-mono text-red-500/70 bg-red-950/30 p-4 rounded-lg border border-red-500/20 text-left space-y-1">
                        <div>[ERR_CODE: 0x503_VOICE_MOD]</div>
                        <div>&gt; Initializing Audio Driver... FAILED</div>
                        <div>&gt; Connecting to Neural TTS... TIMEOUT</div>
                        <div className="animate-pulse">&gt; CRITICAL: Audio hardware unreachable</div>
                      </div>
                      <p className="text-[10px] font-mono text-gray-500 pt-2">{t('panel.moduleInaccessible')}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'persona' && (
                  <div className="space-y-4">
                    <label className="text-xs text-cyan-500 font-mono tracking-wider uppercase">{t('panel.characterImprint')}</label>
                    <div className="space-y-2">
                      <textarea
                        value={config.systemPrompt}
                        onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                        className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
                        placeholder={t('panel.systemPromptPlaceholder')}
                      />
                      <div className="flex justify-end">
                        <span className="text-[9px] text-gray-500 font-mono">{t('panel.tokenCount')}: {config.systemPrompt ? Math.ceil(config.systemPrompt.length / 4) : 0}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-4 border-t border-white/5">
                      <label className="text-[10px] text-gray-500 font-mono uppercase">{t('panel.quickPresets')}</label>
                      {PRESET_CHARACTERS.map(char => (
                        <button
                          key={char.id}
                          onClick={() => handleCharacterSelect(char)}
                          className="text-left p-2 rounded hover:bg-white/5 flex items-center gap-2 group"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${char.themeColor === 'red' ? 'bg-red-500' : 'bg-cyan-500'}`} />
                          <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{char.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'cloud' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Database className="w-5 h-5 text-purple-400" />
                        <div className="font-mono text-sm text-purple-200">{t('panel.privateCloud')}</div>
                      </div>
                      <p className="text-[10px] text-purple-400/60 leading-relaxed">
                        {t('panel.cloudDesc')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-gray-500 font-mono">{t('panel.syncServerUrl')}</label>
                      <Input
                        value={config.syncServerUrl}
                        onChange={(e) => setConfig({ ...config, syncServerUrl: e.target.value })}
                        className="bg-black/40 border-white/10 text-cyan-100 font-mono text-xs h-10"
                        placeholder="http://..."
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs">
                        <RefreshCw className="w-3 h-3 mr-2" /> {t('panel.syncNow')}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Palette className="w-5 h-5 text-cyan-400" />
                        <div className="font-mono text-sm text-cyan-200">{t('panel.appearance.title')}</div>
                      </div>
                      <p className="text-[10px] text-cyan-400/60 leading-relaxed">
                        {t('panel.appearance.desc')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Cube Theme */}
                      <button
                        onClick={() => onVisualThemeChange?.('cube')}
                        className={`p-5 rounded-xl border text-left transition-all ${visualTheme === 'cube'
                          ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-black/40 rounded-lg border border-white/10">
                            <Box className="w-5 h-5 text-cyan-400" />
                          </div>
                          {visualTheme === 'cube' && (
                            <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">{t('panel.appearance.title')}</span>
                          )}
                        </div>
                        <div className="font-mono text-xs text-gray-200 mb-1">{t('panel.appearance.cube')}</div>
                        <div className="text-[10px] text-gray-500 leading-relaxed">{t('panel.appearance.cubeDesc')}</div>
                      </button>

                      {/* Globe Theme */}
                      <button
                        onClick={() => onVisualThemeChange?.('globe')}
                        className={`p-5 rounded-xl border text-left transition-all ${visualTheme === 'globe'
                          ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-black/40 rounded-lg border border-white/10">
                            <Globe className="w-5 h-5 text-cyan-400" />
                          </div>
                          {visualTheme === 'globe' && (
                            <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">{t('panel.appearance.title')}</span>
                          )}
                        </div>
                        <div className="font-mono text-xs text-gray-200 mb-1">{t('panel.appearance.globe')}</div>
                        <div className="text-[10px] text-gray-500 leading-relaxed">{t('panel.appearance.globeDesc')}</div>
                      </button>
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
