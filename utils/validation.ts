import { LLMConfig, MessageContent, GenerationRequest } from '@/types';

/**
 * 验证 LLM 配置的完整性
 * @param config 待验证的配置对象
 * @returns 验证结果对象
 */
export function validateLLMConfig(config: Partial<LLMConfig>): { valid: boolean; error?: string } {
    if (!config.provider) {
        return { valid: false, error: 'Provider is required' };
    }
    
    if (!config.baseUrl) {
        return { valid: false, error: 'Base URL is required' };
    }

    try {
        new URL(config.baseUrl);
    } catch {
        return { valid: false, error: 'Invalid Base URL format' };
    }

    if (config.provider !== 'ollama' && !config.apiKey) {
        return { valid: false, error: 'API Key is required for non-local providers' };
    }

    if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
        return { valid: false, error: 'Temperature must be between 0 and 2' };
    }

    return { valid: true };
}

/**
 * 验证消息内容格式
 * @param messages 消息数组
 */
export function validateMessages(messages: MessageContent[]): { valid: boolean; error?: string } {
    if (!Array.isArray(messages) || messages.length === 0) {
        return { valid: false, error: 'Messages array cannot be empty' };
    }

    for (const msg of messages) {
        if (!msg.role || !['system', 'user', 'assistant'].includes(msg.role)) {
            return { valid: false, error: `Invalid role in message: ${msg.role}` };
        }
        if (typeof msg.content !== 'string' || msg.content.trim() === '') {
            return { valid: false, error: 'Message content cannot be empty' };
        }
    }

    return { valid: true };
}

/**
 * 验证生成请求
 */
export function validateGenerationRequest(req: GenerationRequest): { valid: boolean; error?: string } {
    if (!req.prompt || req.prompt.length < 2) {
        return { valid: false, error: 'Prompt is too short (min 2 chars)' };
    }

    if (req.prompt.length > 8000) {
        return { valid: false, error: 'Prompt is too long (max 8000 chars)' };
    }

    return { valid: true };
}
