import { useAI } from '@/hooks/useAI';
import { useGestureHandler } from '@/hooks/useGestureHandler';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSpeech } from '@/hooks/useSpeech';
import { useUIState } from '@/hooks/useUIState';
import { Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Battery, Clock, CornerDownLeft, CornerRightDown, CornerUpLeft, CornerUpRight, Cpu, Image as ImageIcon, MicOff, Wifi } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AIGeneratorPanel } from './ai/AIGeneratorPanel';
import { ConfigPanel } from './ai/ConfigPanel';
import { CubeVisual } from './ai/CubeVisual';
import { DebateOverlay } from './ai/DebateOverlay';
import { IntelligentCenter } from './ai/IntelligentCenter';
import { MultimodalArtifact } from './ai/MultimodalArtifact';
import { OrbitalMenu } from './ai/OrbitalMenu';
import { TerminalPanel } from './ai/TerminalPanel';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MCPServerPanel } from './modules/MCPServerPanel';
import { TaskPod } from './modules/TaskPod';
import { WorkflowPanel } from './modules/WorkflowPanel';
import { PageSwitcher } from './ui/PageSwitcher';
import { YYC3Background } from './YYC3Background';

// --- Futuristic HUD Component ---
const HUDOverlay = ({ themeColor, speechState }: { themeColor: 'cyan' | 'red', speechState: string }) => {
  const colorClass = themeColor === 'cyan' ? 'text-cyan-400 border-cyan-500/30' : 'text-red-400 border-red-500/30';
  const [coords] = useState(() => ({
    a: Math.floor(Math.random() * 1000),
    b: Math.floor(Math.random() * 100),
    c: Math.floor(Math.random() * 1000),
    d: Math.floor(Math.random() * 100),
  }));

  return (
    <div className="absolute inset-4 pointer-events-none z-10 flex flex-col justify-between select-none overflow-hidden">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className={`flex items-center gap-2 border-l-2 ${colorClass} pl-2 opacity-70`}>
          <Cpu className="w-4 h-4 animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest">YYC³.CORE.V7</span>
        </div>
        <div className="flex gap-1">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`w-1 h-2 ${i < 8 ? (themeColor === 'cyan' ? 'bg-cyan-500' : 'bg-red-500') : 'bg-gray-800'} opacity-50`} />
          ))}
        </div>
        <div className={`flex items-center gap-2 border-r-2 ${colorClass} pr-2 opacity-70`}>
          <span className="font-mono text-[10px] tracking-widest">{new Date().toLocaleTimeString([], { hour12: false })}</span>
          <Wifi className="w-4 h-4" />
        </div>
      </div>

      {/* Corner Brackets */}
      <div className={`absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 ${colorClass}`} />
      <div className={`absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 ${colorClass}`} />
      <div className={`absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 ${colorClass}`} />
      <div className={`absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 ${colorClass}`} />

      {/* Side Data Lines */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-24 bg-linear-to-b from-transparent via-white/20 to-transparent" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-24 bg-linear-to-b from-transparent via-white/20 to-transparent" />

      {/* Bottom Bar */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1 opacity-60">
          <div className="text-[8px] font-mono text-white/40">COORDS: {coords.a}.{coords.b} / {coords.c}.{coords.d}</div>
          <div className={`h-px w-24 ${themeColor === 'cyan' ? 'bg-cyan-500' : 'bg-red-500'}`} />
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono tracking-widest ${speechState === 'listening' ? 'animate-pulse text-white' : 'text-white/30'}`}>
            {speechState === 'listening' ? '● LISTENING' : '○ STANDBY'}
          </span>
          <Battery className="w-4 h-4 text-white/50" />
        </div>
      </div>
    </div>
  );
};

export function ResponsiveAIAssistant() {
  // --- Unified UI State (useReducer) ---
  const {
    state,
    setPanel,
    setMenuPosition,
    setShowGuide,
    setTextMode,
    toggleTheme,
    setThemeColor,
    setInspectingArtifact,
    setIsDragging,
    setPendingImage,
    setIsMessageVisible,
    setDebateStatus,
  } = useUIState();

  const {
    showConfig, showHistory, showDebate, showOrbitalMenu,
    showIntelligentCenter, showTaskPod, showMCPServer, showWorkflow,
    showAIGenerator, showPageSwitcher, menuPosition, showGuide,
    textMode, themeColor, inspectingArtifact, isDragging,
    pendingImage, isMessageVisible, debateStatus,
  } = state;

  // Stable random IDs for display
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 11).toUpperCase());
  const [artifactId] = useState(() => Math.random().toString(16).substring(2, 10).toUpperCase());

  // --- Command Actions ---
  const commands = useCallback(() => ({
    openSettings: () => setPanel('showConfig', true),
    openHistory: () => setPanel('showHistory', true),
    closePanel: () => { setPanel('showHistory', false); setPanel('showConfig', false); },
    setThemeRed: () => setThemeColor('red'),
    setThemeCyan: () => setThemeColor('cyan'),
  }), [setPanel, setThemeColor]);

  // --- Core Hooks ---
  const {
    messages,
    config,
    updateConfig,
    processingState,
    sendMessage,
    clearMessages
  } = useAI(commands());

  // --- Speech ---
  const handleAIResponseRef = useRef<(responseText: string) => void>(undefined);

  const {
    speechState,
    startListening,
    stopListening,
    speak,
    transcript,
    error: speechError,
    clearError: clearSpeechError,
    analyserNode
  } = useSpeech((finalTranscript) => {
    setShowGuide(false);
    if (!textMode) {
      const images = pendingImage ? [pendingImage] : undefined;
      setPendingImage(null);
      sendMessage(finalTranscript, images).then(handleAIResponseRef.current);
    }
  });

  useEffect(() => {
    handleAIResponseRef.current = (responseText: string) => {
      if (responseText) speak(responseText, config);
    };
  });

  // --- Error Handling Effect ---

  useEffect(() => {
    if (speechError === 'permission-denied' || speechError === 'not-supported') {

      setTextMode(true);
      toast.error("AUDIO SYSTEM FAILURE", {
        description: "Switching to manual input protocol.",
        icon: <MicOff className="w-4 h-4" />,
        style: { fontFamily: 'monospace' }
      });
      clearSpeechError();
    }
  }, [speechError, clearSpeechError, config, setTextMode]);

  // --- Navigation ---
  const handleSwitchPage = (pageId: string) => {
    // Close all panels
    setPanel('showTaskPod', false);
    setPanel('showMCPServer', false);
    setPanel('showWorkflow', false);
    setPanel('showAIGenerator', false);
    setPanel('showIntelligentCenter', false);
    setPanel('showHistory', false);
    setPanel('showConfig', false);

    // Open selected
    switch (pageId) {
      case 'home': break; // Just close all overlays
      case 'tasks': setPanel('showTaskPod', true); break;
      case 'mcp': setPanel('showMCPServer', true); break;
      case 'workflow': setPanel('showWorkflow', true); break;
      case 'ai_gen': setPanel('showAIGenerator', true); break;
      case 'intelligent': setPanel('showIntelligentCenter', true); break;
    }
  };

  const getCurrentPageId = () => {
    if (showTaskPod) return 'tasks';
    if (showMCPServer) return 'mcp';
    if (showWorkflow) return 'workflow';
    if (showAIGenerator) return 'ai_gen';
    if (showIntelligentCenter) return 'intelligent';
    return 'home';
  };

  // --- Handlers ---
  const handleTerminalSubmit = (text: string, image?: string) => {
    setShowGuide(false);
    setTextMode(false);

    const images = image ? [image] : undefined;
    setPendingImage(null);

    sendMessage(text, images).then(handleAIResponseRef.current);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setInspectingArtifact({ type: 'image', content: base64 });
        setPendingImage(base64);
        if (!textMode) speak("Visual data captured. Rendering hologram.", config);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Derived State ---
  const currentVisualState = debateStatus !== 'idle' ? debateStatus : (processingState === 'processing' ? 'processing' : speechState);

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 5000);
    return () => clearTimeout(timer);
  }, [setShowGuide]);

  // Auto-dismiss message after 1 minute
  useEffect(() => {
    if (messages.length > 0) {

      setIsMessageVisible(true);
      const timer = setTimeout(() => {
        setIsMessageVisible(false);
      }, 60000); // 60 seconds
      return () => clearTimeout(timer);
    }
  }, [messages, setIsMessageVisible]);

  // --- Keyboard Shortcuts ---
  useKeyboardShortcuts(
    { showConfig, showHistory, showDebate, showIntelligentCenter, showTaskPod, showMCPServer, showWorkflow, showAIGenerator, showOrbitalMenu, showPageSwitcher, inspectingArtifact, textMode },
    { setInspectingArtifact, setPanel, setTextMode },
  );

  // --- Gestures ---
  const gestureHandler = useGestureHandler(
    { textMode, showDebate, showConfig, showHistory, showOrbitalMenu, inspectingArtifact, showIntelligentCenter, showTaskPod, showMCPServer, showWorkflow, showAIGenerator, themeColor },
    { setPanel, setMenuPosition, setShowGuide, setTextMode, setThemeColor },
    { startListening, stopListening },
  );

  const {
    handleTouchStart,
    handleNativeTouchStart,
    handleTouchEnd,
    handlePanEnd,
  } = gestureHandler;

  // --- Theme ---
  const isRed = themeColor === 'red';
  const themeClasses = {
    bg: isRed ? 'bg-[#0f0202] text-red-100' : 'bg-[#020610] text-cyan-100',
    blob1: isRed ? 'bg-red-900/10' : 'bg-cyan-900/10',
    blob2: isRed ? 'bg-orange-900/10' : 'bg-blue-900/10',
    visualizer: isRed ? 'bg-orange-500' : 'bg-cyan-400',
    historyBg: isRed ? 'bg-[#0f0202]/95 border-red-500/20' : 'bg-[#020610]/95 border-cyan-500/20',
    userMsg: isRed ? 'bg-red-500/10 text-red-100 border-red-500/20' : 'bg-cyan-500/10 text-cyan-100 border-cyan-500/20',
    divider: isRed ? 'via-red-500/50' : 'via-cyan-500/50',
    dropOverlay: isRed ? 'bg-red-900/50 border-red-400' : 'bg-cyan-900/50 border-cyan-400'
  };

  return (
    <motion.div
      className={`h-screen w-full font-sans overflow-hidden select-none relative touch-none transition-colors duration-1000 ${themeClasses.bg}`}
      onPointerDown={handleTouchStart}
      onTouchStart={handleNativeTouchStart}
      onPointerUp={handleTouchEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPanEnd={handlePanEnd}
    >
      {/* 1. Futuristic Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* YYC3 ASCII Art Background */}
        <YYC3Background />

        {/* Grid Lines */}
        <div className={`absolute inset-0 opacity-[0.03]`}
          style={{
            backgroundImage: `linear-gradient(${isRed ? '#ff0000' : '#00ffff'} 1px, transparent 1px), linear-gradient(90deg, ${isRed ? '#ff0000' : '#00ffff'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}>
        </div>
        {/* Radial Glow */}
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] ${isRed ? 'bg-red-900/20' : 'bg-cyan-900/20'}`}
        />
        {/* Scanlines */}
        <div className="absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-20"></div>
      </div>

      {/* 2. Drag Overlay (Holographic) */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md border-2 border-dashed m-8 rounded-xl ${themeClasses.dropOverlay}`}
          >
            <div className="text-xl font-mono tracking-widest animate-pulse flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <ImageIcon className="w-20 h-20 opacity-50" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-10px] border-t-2 border-b-2 border-current rounded-full opacity-30"
                />
              </div>
              <div>
                <p>DATA INGESTION MODE</p>
                <p className="text-xs opacity-50 mt-2">RELEASE TO ANALYZE</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Guide Overlay - Tech Style */}
      <AnimatePresence>
        {showGuide && !isDragging && !speechError && !textMode && !showDebate && !inspectingArtifact && !showIntelligentCenter && !showTaskPod && !showMCPServer && !showWorkflow && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-15 pointer-events-none"
          >
            {/* Center Hints */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-white/30 text-[10px] font-mono tracking-[0.3em] animate-pulse border px-4 py-1 border-white/10 rounded-full bg-black/20 backdrop-blur-sm">
                HOLD: VOICE // DOUBLE: MENU
              </div>
            </div>

            {/* Cardinal Points */}
            <div className="absolute top-16 w-full flex justify-center opacity-40 animate-pulse">
              <div className="flex flex-col items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <span className="text-[9px] font-mono tracking-widest">INPUT_TERMINAL</span>
              </div>
            </div>
            <div className="absolute bottom-16 w-full flex justify-center opacity-40 animate-pulse">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-mono tracking-widest">MEMORY_STREAM</span>
                <ArrowDown className="w-3 h-3" />
              </div>
            </div>
            <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-40 animate-pulse">
              <div className="flex flex-col items-center gap-1 -rotate-90">
                <ArrowLeft className="w-3 h-3 rotate-90" />
                <span className="text-[9px] font-mono tracking-widest">NEURAL_HUB</span>
              </div>
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-40 animate-pulse">
              <div className="flex flex-col items-center gap-1 rotate-90">
                <ArrowRight className="w-3 h-3 -rotate-90" />
                <span className="text-[9px] font-mono tracking-widest">SYS_CONFIG</span>
              </div>
            </div>

            {/* Diagonal Points */}
            <div className="absolute top-16 left-12 opacity-30 animate-pulse hidden md:block">
              <div className="flex flex-col items-center gap-1 -rotate-45">
                <CornerRightDown className="w-3 h-3" />
                <span className="text-[8px] font-mono tracking-widest">TASK_POD</span>
              </div>
            </div>
            <div className="absolute top-16 right-12 opacity-30 animate-pulse hidden md:block">
              <div className="flex flex-col items-center gap-1 rotate-45">
                <CornerDownLeft className="w-3 h-3" />
                <span className="text-[8px] font-mono tracking-widest">DEBATE_MOD</span>
              </div>
            </div>
            <div className="absolute bottom-16 left-12 opacity-30 animate-pulse hidden md:block">
              <div className="flex flex-col items-center gap-1 -rotate-135">
                <CornerUpRight className="w-3 h-3" />
                <span className="text-[8px] font-mono tracking-widest">RST_SESSION</span>
              </div>
            </div>
            <div className="absolute bottom-16 right-12 opacity-30 animate-pulse hidden md:block">
              <div className="flex flex-col items-center gap-1 rotate-135">
                <CornerUpLeft className="w-3 h-3" />
                <span className="text-[8px] font-mono tracking-widest">TGL_THEME</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <LanguageSwitcher />
      </div>

      {/* 5. Persistent HUD Overlay */}
      {!textMode && !showDebate && !showHistory && (
        <HUDOverlay themeColor={themeColor} speechState={speechState} />
      )}

      {/* 5. Main Stage */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center pointer-events-none">

        {/* Core Visual */}
        <div className={`pointer-events-auto z-30 transition-all duration-700 ${textMode ? 'scale-75 -translate-y-12 blur-sm opacity-50' : ''}`}>
          <CubeVisual
            state={currentVisualState}
            onClick={() => {
              if (textMode || showDebate || inspectingArtifact || showIntelligentCenter || showTaskPod || showMCPServer || showWorkflow || showAIGenerator) return;
              if (speechState === 'listening') {
                stopListening();
              } else {
                startListening();
              }
            }}
            analyserNode={analyserNode}
          />
          {/* Floor Reflection */}
          <div className={`absolute -bottom-24 left-1/2 -translate-x-1/2 w-48 h-12 bg-linear-to-t from-transparent ${isRed ? 'via-red-500/10' : 'via-cyan-500/10'} to-transparent opacity-50 blur-xl rounded-full transform scale-x-150`} />
        </div>

        {/* Captions - Holographic Style */}
        <div className={`absolute bottom-32 w-full px-6 text-center transition-all duration-500 ${textMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <AnimatePresence mode="wait">
            {messages.length > 0 && isMessageVisible ? (
              <motion.div
                key={messages[messages.length - 1].id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="max-w-2xl mx-auto"
              >
                <div className={`inline-block text-lg md:text-xl font-light leading-relaxed tracking-wide px-8 py-6 rounded-2xl backdrop-blur-xl border ${isRed ? 'bg-[#0f0505]/90 border-red-500/30 shadow-[0_0_40px_rgba(220,38,38,0.15)]' : 'bg-[#020610]/90 border-cyan-500/30 shadow-[0_0_40px_rgba(8,145,178,0.15)]'}`}>
                  <span className={isRed ? 'text-red-100' : 'text-cyan-100'}>
                    {messages[messages.length - 1].content}
                  </span>
                </div>
              </motion.div>
            ) : (<div className="h-8" />)}
          </AnimatePresence>
        </div>

        {/* Visualizer when Listening */}
        {!textMode && speechState === 'listening' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5"
          >
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [5, 25, 5], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
                className={`w-1 rounded-sm ${themeClasses.visualizer} shadow-[0_0_8px_currentColor]`}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* 6. Text Mode Input (Terminal Style) - UPGRADED */}
      <TerminalPanel
        isOpen={textMode}
        onClose={() => setTextMode(false)}
        onSubmit={handleTerminalSubmit}
        speechState={speechState}
        onStartListening={startListening}
        onStopListening={stopListening}
        transcript={transcript}
        pendingImage={pendingImage}
        setPendingImage={setPendingImage}
      />

      {/* 7. Memory Stream (History) - Cyberpunk Style */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 25 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.y < -50) setPanel('showHistory', false);
            }}
            className={`absolute inset-0 z-40 flex flex-col pointer-events-auto backdrop-blur-3xl ${themeClasses.historyBg}`}
          >
            {/* Header */}
            <div className="pt-12 pb-4 px-6 border-b border-white/10 flex justify-between items-end bg-linear-to-b from-black to-transparent">
              <div>
                <h2 className="text-2xl font-light text-white tracking-widest uppercase flex items-center gap-3">
                  <Clock className="w-6 h-6 text-cyan-500" />
                  <span className="font-mono">MEMORY_LOGS</span>
                </h2>
                <p className="text-[10px] font-mono text-cyan-500/50 mt-2 flex items-center gap-2">
                  <span>SESSION_ID: {sessionId}</span>
                </p>
              </div>
              <div className="opacity-50 text-[10px] font-mono text-right">
                <div>ENCRYPTED // {messages.length} FRAGMENTS</div>
                <div className="mt-1 text-white/30">SWIPE UP TO DISMISS</div>
              </div>
            </div>

            {/* Content Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
                  <Activity className="w-16 h-16 text-cyan-500/50" />
                  <p className="font-mono text-sm">NO DATA FRAGMENTS FOUND</p>
                </div>
              )}

              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 opacity-50">
                    <span className="text-[10px] font-mono">{msg.role === 'user' ? 'CMD_INPUT' : 'SYS_RESPONSE'}</span>
                    <div className={`h-px w-12 ${isRed ? 'bg-red-500' : 'bg-cyan-500'}`} />
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl border backdrop-blur-md ${msg.role === 'user'
                    ? themeClasses.userMsg
                    : 'bg-white/5 border-white/10 text-gray-300'
                    }`}>
                    {msg.images && msg.images.length > 0 && (
                      <div className="mb-3">
                        <img src={`data:image/jpeg;base64,${msg.images[0]}`} className="rounded-lg max-h-40 border border-white/10" alt="Context" loading="lazy" />
                      </div>
                    )}
                    <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Configuration Panel */}
      <ConfigPanel
        isOpen={showConfig}
        onClose={() => setPanel('showConfig', false)}
        config={config}
        onSave={updateConfig}
      />

      {/* 9. Intelligent Center (Left Swipe) - UPGRADED */}
      <IntelligentCenter
        active={showIntelligentCenter}
        onClose={() => setPanel('showIntelligentCenter', false)}
        onShowSwitcher={() => setPanel('showPageSwitcher', true)}
        onLaunchModule={(id) => {
          setPanel('showIntelligentCenter', false);
          if (id === 'tasks') setPanel('showTaskPod', true);
          if (id === 'engine') setPanel('showConfig', true);
          if (id === 'memory') setPanel('showHistory', true);

          // Mapped Functions for User Request
          if (id === 'security') setPanel('showWorkflow', true); // Security -> Workflow for now
          if (id === 'neural_net') setPanel('showAIGenerator', true);
          if (id === 'mcp_server') setPanel('showMCPServer', true);
          if (id === 'workflows') setPanel('showWorkflow', true);
        }}
      />

      {/* 10. Task Pod (Diagonal Top-Left) */}
      <TaskPod
        isOpen={showTaskPod}
        onClose={() => setPanel('showTaskPod', false)}
        onShowSwitcher={() => setPanel('showPageSwitcher', true)}
      />

      {/* 11. Orbital Menu (Double Tap) */}
      <OrbitalMenu
        isOpen={showOrbitalMenu}
        onClose={() => setPanel('showOrbitalMenu', false)}
        position={menuPosition}
        onSelect={(id) => {
          if (id === 'history') setPanel('showHistory', true);
          if (id === 'config') setPanel('showConfig', true);
          if (id === 'reset') clearMessages();
          if (id === 'theme') toggleTheme();
        }}
      />

      {/* 12. Debate Overlay (Diagonal Top-Right) */}
      <DebateOverlay
        isOpen={showDebate}
        onClose={() => setPanel('showDebate', false)}
        initialTopic={messages.length > 0 ? messages[messages.length - 1].content : "The Future of AI"}
        mainConfig={config}
        onSpeak={speak}
        onStatusChange={setDebateStatus}
      />

      {/* 13. Artifact Inspector (Image Viewer) */}
      <AnimatePresence>
        {inspectingArtifact && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setInspectingArtifact(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="relative max-w-full max-h-full"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={`data:image/jpeg;base64,${inspectingArtifact.content}`}
                className="rounded-lg border border-cyan-500/50 shadow-[0_0_50px_rgba(8,145,178,0.3)]"
                alt="Artifact"
                loading="lazy"
              />
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <p className="text-xs font-mono text-cyan-500 tracking-widest">ARTIFACT_ID: {artifactId}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 14. Multimodal Artifact Container (Dynamic Elements) */}
      <MultimodalArtifact type="text" content="" messages={messages} />

      {/* 15. New Modules: MCP, Workflow, AI Gen */}
      <MCPServerPanel
        isOpen={showMCPServer}
        onClose={() => setPanel('showMCPServer', false)}
        onShowSwitcher={() => setPanel('showPageSwitcher', true)}
      />
      <WorkflowPanel
        isOpen={showWorkflow}
        onClose={() => setPanel('showWorkflow', false)}
        onShowSwitcher={() => setPanel('showPageSwitcher', true)}
      />
      <AIGeneratorPanel
        isOpen={showAIGenerator}
        onClose={() => setPanel('showAIGenerator', false)}
        onShowSwitcher={() => setPanel('showPageSwitcher', true)}
      />

      <PageSwitcher
        isOpen={showPageSwitcher}
        onClose={() => setPanel('showPageSwitcher', false)}
        onSwitch={handleSwitchPage}
        currentPage={getCurrentPageId()}
      />

    </motion.div>
  );
}
