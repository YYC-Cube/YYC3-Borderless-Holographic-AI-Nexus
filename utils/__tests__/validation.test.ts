import { LLMConfig, MessageContent } from '@/types';
import { describe, expect, it } from 'vitest';
import { validateGenerationRequest, validateLLMConfig, validateMessages } from '../validation';

describe('LLM Configuration Validation', () => {
  it('should validate a correct configuration', () => {
    const validConfig: LLMConfig = {
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
      apiKey: '',
      model: 'llama3',
      ttsProvider: 'browser',
      ttsModel: 'tts-1',
      ttsVoice: 'alloy',
      ttsSpeed: 1.0
    };
    const result = validateLLMConfig(validConfig);
    expect(result.valid).toBe(true);
  });

  it('should fail if provider is missing', () => {
    const invalidConfig = { baseUrl: 'http://localhost' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateLLMConfig(invalidConfig as any);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Provider is required');
  });

  it('should fail if apiKey is missing for remote providers', () => {
    const invalidConfig: Partial<LLMConfig> = {
      provider: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '' // Missing
    };
    const result = validateLLMConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('API Key is required');
  });

  it('should fail if temperature is out of range', () => {
    const invalidConfig: Partial<LLMConfig> = {
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
      temperature: 2.5
    };
    const result = validateLLMConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Temperature must be between 0 and 2');
  });
});

describe('Message Validation', () => {
  it('should validate correct messages', () => {
    const messages: MessageContent[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' }
    ];
    const result = validateMessages(messages);
    expect(result.valid).toBe(true);
  });

  it('should fail on empty array', () => {
    const result = validateMessages([]);
    expect(result.valid).toBe(false);
  });

  it('should fail on invalid role', () => {
    const messages = [{ role: 'admin', content: 'Hello' }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateMessages(messages as any);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid role');
  });
});

describe('Generation Request Validation', () => {
  it('should block audio generation due to system fault', () => {
    const request = { mode: 'audio' as const, prompt: 'test' };
    const result = validateGenerationRequest(request);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('system fault');
  });

  it('should validate correct image request', () => {
    const request = { mode: 'image' as const, prompt: 'A cyber city' };
    const result = validateGenerationRequest(request);
    expect(result.valid).toBe(true);
  });
});
