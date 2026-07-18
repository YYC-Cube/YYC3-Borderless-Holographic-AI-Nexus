import { DEFAULT_SERVER_URL, isMixedContent, syncPull, syncPush } from '@/utils/cloud';
import { DEFAULT_CONFIG, generateCompletion, generateCompletionStream, LLMConfig, MessageContent } from '@/utils/llm';
import { getEmbedding, MemoryEntry, retrieveContext } from '@/utils/rag';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Maximum number of messages retained in the conversation history. */
const MAX_MESSAGES = 500;

/** LLMConfig extended with the cloud sync server URL (persisted alongside LLM settings). */
export type ExtendedConfig = LLMConfig;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[]; // Base64
}

export type ProcessingState = 'idle' | 'processing' | 'streaming';

interface CommandActions {
  openSettings: () => void;
  openHistory: () => void;
  closePanel: () => void;
  setThemeRed: () => void;
  setThemeCyan: () => void;
}

export function useAI(actions: CommandActions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [config, setConfig] = useState<ExtendedConfig>({
    ...DEFAULT_CONFIG,
    syncServerUrl: DEFAULT_SERVER_URL
  });
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [streamingText, setStreamingText] = useState<string>('');
  const processingRef = useRef(false);
  const streamControllerRef = useRef<AbortController | null>(null);
  const [userId] = useState(() => {
    let uid = localStorage.getItem('yyc_uid');
    if (!uid) {
      uid = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('yyc_uid', uid);
    }
    return uid;
  });

  // 1. Persistence & Auto-Sync
  useEffect(() => {
    // Load local first
    const savedConfig = localStorage.getItem('yyc_config');
    if (savedConfig) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      try { setConfig(JSON.parse(savedConfig)); } catch (e) { console.error(e); }
    }
    const savedHistory = localStorage.getItem('yyc_history');
    if (savedHistory) {
      try { setMessages(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    const savedMemories = localStorage.getItem('yyc_memories');
    if (savedMemories) {
      try { setMemories(JSON.parse(savedMemories)); } catch (e) { console.error(e); }
    }

    // Try to pull from cloud on startup
    const pullFromCloud = async () => {
      // Only try sync if we have a URL and it's NOT mixed content
      if (!config.syncServerUrl || isMixedContent(config.syncServerUrl)) return;

      const cloudData = await syncPull(config.syncServerUrl, userId);
      if (cloudData.success && cloudData.data) {
        console.log("Cloud Sync Pulled:", cloudData);
        if (cloudData.data.messages?.length > 0) {
          setMessages(cloudData.data.messages);
        }
        if (cloudData.data.config) {
          setConfig(prev => ({ ...prev, ...cloudData.data!.config }));
        }
      } else {
        // Silent fail
      }
    };

    // Delay sync to allow UI to settle
    setTimeout(pullFromCloud, 1000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('yyc_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('yyc_memories', JSON.stringify(memories));
  }, [memories]);

  // Auto-Push to Cloud when messages change (debounced)
  useEffect(() => {
    // Don't setup timer if config is invalid or mixed content
    if (!config.syncServerUrl || isMixedContent(config.syncServerUrl)) return;

    const timer = setTimeout(() => {
      if (messages.length > 0) {
        syncPush(config.syncServerUrl!, userId, {
          config,
          messages
        }).then(_res => {
          // Silent
        });
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [messages, config, userId]);

  const updateConfig = (newConfig: ExtendedConfig) => {
    setConfig(newConfig);
    localStorage.setItem('yyc_config', JSON.stringify(newConfig));
  };

  /** Clears the in-memory conversation history and the persisted localStorage cache. */
  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('yyc_history');
  }, []);

  // 2. Command Parsing
  const parseAndExecuteCommands = (text: string): string => {
    const cmdRegex = /\[\[CMD:(.*?)\]\]/g;
    let match;
    while ((match = cmdRegex.exec(text)) !== null) {
      const cmd = match[1];
      console.log("[AI Command]", cmd);
      switch (cmd) {
        case 'OPEN_SETTINGS': actions.openSettings(); break;
        case 'OPEN_HISTORY': actions.openHistory(); break;
        case 'CLOSE_PANEL': actions.closePanel(); break;
        case 'THEME_RED': actions.setThemeRed(); break;
        case 'THEME_CYAN': actions.setThemeCyan(); break;
      }
    }
    return text.replace(cmdRegex, '').trim();
  };

  // 3. Memory Archiving
  const archiveMemory = async (msg: Message) => {
    if (!msg.content || msg.content.length < 5) return;

    const embedding = await getEmbedding(msg.content, config);
    if (embedding) {
      const newMem: MemoryEntry = {
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: Date.now(),
        embedding
      };
      setMemories(prev => [...prev.slice(-49), newMem]);
    }
  };

  // 4. Interaction Logic
  const sendMessage = useCallback(async (text: string, images?: string[]): Promise<string> => {
    if (!text.trim() && (!images || images.length === 0)) return "";

    // Request deduplication: prevent concurrent requests
    if (processingRef.current) {
      console.warn("[AI] Request blocked: already processing");
      return "";
    }
    processingRef.current = true;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      images
    };

    setMessages(prev => {
      const updated = [...prev, newUserMsg];
      // Enforce message limit: keep only the most recent MAX_MESSAGES
      return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;
    });
    setProcessingState('processing');
    setStreamingText('');

    archiveMemory(newUserMsg);

    try {
      // A. Retrieve Context via RAG
      let systemContext = "";
      if (text.length > 5 && config.provider !== 'moonshot') {
        const ragContext = await retrieveContext(text, memories, config);
        if (ragContext) {
          systemContext = `\n${ragContext}\n(请参考上述记忆回答用户，但不要明确提及"根据记忆")`;
        }
      }

      // B. Construct Messages Payload
      const contextMessages: MessageContent[] = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content,
        images: m.images
      }));

      contextMessages.push({ role: 'user', content: text + systemContext, images });

      // C. Call API with streaming
      let fullResponse = '';

      const controller = generateCompletionStream(contextMessages, config, {
        onToken: (token: string) => {
          fullResponse += token;
          setStreamingText(fullResponse);
        },
        onDone: (fullText: string) => {
          const cleanResponse = parseAndExecuteCommands(fullText);
          const newAiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: cleanResponse };

          setMessages(prev => {
            const updated = [...prev, newAiMsg];
            return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;
          });
          setProcessingState('idle');
          setStreamingText('');
          processingRef.current = false;
          streamControllerRef.current = null;

          archiveMemory(newAiMsg);
        },
        onError: async (error: Error) => {
          console.warn("[AI] Stream failed, falling back to non-streaming:", error.message);

          // Fallback to non-streaming mode
          try {
            const rawResponse = await generateCompletion(contextMessages, config);
            const cleanResponse = parseAndExecuteCommands(rawResponse);
            const newAiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: cleanResponse };

            setMessages(prev => {
              const updated = [...prev, newAiMsg];
              return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;
            });
            setProcessingState('idle');
            setStreamingText('');
            processingRef.current = false;
            streamControllerRef.current = null;

            archiveMemory(newAiMsg);
          } catch (_fallbackErr) {
            setProcessingState('idle');
            setStreamingText('');
            processingRef.current = false;
            streamControllerRef.current = null;
            const errorMsg = "系统连接中断，请检查神经回路配置。";
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errorMsg }]);
          }
        }
      });

      streamControllerRef.current = controller;

      return ""; // Returned immediately; caller should watch streamingText
    } catch (_error) {
      setProcessingState('idle');
      setStreamingText('');
      processingRef.current = false;
      streamControllerRef.current = null;
      const errorMsg = "系统连接中断，请检查神经回路配置。";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errorMsg }]);
      return errorMsg;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, memories, config, actions]);

  return {
    messages,
    config,
    updateConfig,
    processingState,
    streamingText,
    sendMessage,
    setMessages,
    clearMessages
  };
}
