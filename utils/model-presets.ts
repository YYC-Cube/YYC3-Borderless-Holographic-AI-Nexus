import { LLMConfig } from './llm';

export interface ModelPreset {
    id: string;
    name: string;
    provider: 'openai' | 'ollama' | 'deepseek' | 'moonshot' | 'zhipu' | 'yi' | 'anthropic' | 'custom';
    baseUrl: string;
    model: string;
    description: string;
    iconName: string; // We'll store string names and map them in the component
    temperature?: number;
    maxTokens?: number;
    topP?: number;
}

export const DEFAULT_PRESETS: ModelPreset[] = [
    {
        id: 'openai-gpt4o',
        name: 'OpenAI GPT-4o',
        provider: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        description: 'Flagship model, high intelligence',
        iconName: 'Server'
    },
    {
        id: 'anthropic-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        baseUrl: 'https://api.anthropic.com/v1',
        model: 'claude-3-5-sonnet-20240620',
        description: 'Excellent reasoning and coding',
        iconName: 'Box'
    },
    {
        id: 'deepseek-v3',
        name: 'DeepSeek V3',
        provider: 'deepseek',
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat',
        description: 'High performance, open weights',
        iconName: 'Cpu'
    },
    {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        provider: 'deepseek',
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-coder',
        description: 'Specialized for programming',
        iconName: 'Code'
    },
    {
        id: 'zhipu-glm4',
        name: 'Zhipu GLM-4',
        provider: 'zhipu',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        model: 'glm-4',
        description: 'Balanced performance (China)',
        iconName: 'Sparkles'
    },
    {
        id: 'moonshot-8k',
        name: 'Moonshot V1 8k',
        provider: 'moonshot',
        baseUrl: 'https://api.moonshot.cn/v1',
        model: 'moonshot-v1-8k',
        description: 'Long context support',
        iconName: 'Moon'
    },
    {
        id: 'yi-large',
        name: 'Yi Large',
        provider: 'yi',
        baseUrl: 'https://api.lingyiwanwu.com/v1',
        model: 'yi-large',
        description: 'Strong creative writing',
        iconName: 'Code'
    },
    {
        id: 'ollama-llama3',
        name: 'Ollama Llama 3',
        provider: 'ollama',
        baseUrl: 'http://localhost:11434',
        model: 'llama3',
        description: 'Local execution, privacy focused',
        iconName: 'Database'
    },
    {
        id: 'local-lmstudio',
        name: 'Local (LM Studio)',
        provider: 'custom',
        baseUrl: 'http://localhost:1234/v1',
        model: 'local-model',
        description: 'Generic local OpenAI-compatible',
        iconName: 'Laptop'
    }
];

/** Look up a preset from {@link DEFAULT_PRESETS} by id. */
export function getPresetById(id: string): ModelPreset | undefined {
    return DEFAULT_PRESETS.find(p => p.id === id);
}

/**
 * Create a new {@link LLMConfig} from a preset, preserving all unrelated
 * fields (apiKey, systemPrompt, TTS settings, etc.) from `existingConfig`.
 */
export function createConfigFromPreset(preset: ModelPreset, existingConfig: LLMConfig): LLMConfig {
    return {
        ...existingConfig,
        provider: preset.provider,
        baseUrl: preset.baseUrl,
        model: preset.model,
    };
}
