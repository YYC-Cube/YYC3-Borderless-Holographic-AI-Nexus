/**
 * YYC3 Domain Type Definitions
 * 统一类型定义文件，遵循 TypeScript 严格模式
 */

// --- LLM & AI Core Types ---

export type AIProvider = 'ollama' | 'openai' | 'deepseek' | 'moonshot' | 'zhipu' | 'yi' | 'anthropic' | 'custom';
export type TTSProvider = 'browser' | 'openai' | 'edge';

export interface LLMConfig {
    provider: AIProvider;
    baseUrl: string;
    apiKey: string;
    model: string;
    systemPrompt?: string;
    // TTS Settings
    ttsProvider: TTSProvider;
    ttsModel: string;
    ttsVoice: string;
    ttsSpeed: number;
    // UI Settings
    syncServerUrl?: string; 
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    customModelName?: string;
}

export interface MessageContent {
    role: 'system' | 'user' | 'assistant';
    content: string;
    images?: string[]; // Base64 strings
}

// --- Generator Panel Types ---

export type GeneratorMode = 'text' | 'image' | 'audio' | 'video';

export interface GenerationRequest {
    mode: GeneratorMode;
    prompt: string;
    params?: {
        guidanceScale?: number;
        steps?: number;
    };
}

// --- MCP Server Types ---

export type ServerType = 'github' | 'slack' | 'postgres' | 'filesystem' | 'custom';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface ServerNode {
    id: string;
    name: string;
    type: ServerType;
    status: ConnectionStatus;
    latency: string; // e.g., "45ms" or "-"
    endpoint?: string;
}

// --- Workflow Types ---

export type WorkflowStatus = 'active' | 'idle' | 'failed';

export interface WorkflowDef {
    id: number;
    name: string;
    steps: number;
    status: WorkflowStatus;
    lastRun: string;
    successRate: string;
}
