import { LLMConfig, MessageContent } from '@/types';
import { fetchWithRetry, generateCompletion, generateCompletionStream, StreamCallbacks } from '@/utils/llm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const baseConfig: LLMConfig = {
  provider: 'openai',
  baseUrl: 'https://api.openai.com',
  apiKey: 'test-key',
  model: 'gpt-4',
  ttsProvider: 'browser',
  ttsModel: 'tts-1',
  ttsVoice: 'alloy',
  ttsSpeed: 1.0,
};

function mockChatResponse(content: string) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({
      choices: [{ message: { content } }],
    }),
  });
}

describe('fetchWithRetry', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should succeed on first attempt', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    const response = await fetchWithRetry('https://example.com', {});
    expect(response.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on server error (5xx)', async () => {
    // First call: 500 error
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    // Second call: success
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

    const response = await fetchWithRetry('https://example.com', {}, 2);
    expect(response.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should retry on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Error'));
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

    const response = await fetchWithRetry('https://example.com', {}, 2);
    expect(response.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should NOT retry on client error (4xx)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    const response = await fetchWithRetry('https://example.com', {}, 2);
    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should throw after max retries', async () => {
    mockFetch.mockRejectedValue(new Error('Network Error'));

    await expect(fetchWithRetry('https://example.com', {}, 2)).rejects.toThrow('Network Error');
    expect(mockFetch).toHaveBeenCalledTimes(3); // initial + 2 retries
  });
});

describe('generateCompletion', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should return AI response on success', async () => {
    mockChatResponse('Hello, how can I help?');

    const messages: MessageContent[] = [{ role: 'user', content: 'Hi' }];
    const result = await generateCompletion(messages, baseConfig);
    expect(result).toBe('Hello, how can I help?');
  });

  it('should throw on invalid config', async () => {
    const messages: MessageContent[] = [{ role: 'user', content: 'Hi' }];
    await expect(
      generateCompletion(messages, { ...baseConfig, provider: '' as unknown as typeof baseConfig.provider })
    ).rejects.toThrow('Provider is required');
  });

  it('should include system prompt with UI commands', async () => {
    mockChatResponse('OK');

    const messages: MessageContent[] = [{ role: 'user', content: 'Test' }];
    await generateCompletion(messages, baseConfig);

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    const systemMsg = callBody.messages[0];
    expect(systemMsg.role).toBe('system');
    expect(systemMsg.content).toContain('[[CMD:');
  });
});

describe('generateCompletionStream', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should call onToken for each chunk and onDone with full text', async () => {
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      'data: [DONE]\n\n',
    ];

    // Mock a readable stream
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(chunks[0]) })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(chunks[1]) })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(chunks[2]) })
        .mockResolvedValueOnce({ done: true }),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: { getReader: () => mockReader },
    });

    const tokens: string[] = [];
    let finalText = '';

    const callbacks: StreamCallbacks = {
      onToken: (token: string) => { tokens.push(token); },
      onDone: (fullText: string) => { finalText = fullText; },
      onError: (_error: Error) => { },
    };

    const messages: MessageContent[] = [{ role: 'user', content: 'Hi' }];
    const _controller = generateCompletionStream(messages, baseConfig, callbacks);

    // Wait for async stream processing
    await new Promise(r => setTimeout(r, 100));

    expect(tokens.length).toBeGreaterThan(0);
    expect(finalText).toBe('Hello world');
  });

  it('should call onError on API failure', async () => {
    vi.useFakeTimers();
    
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    let errorCaught: Error | null = null;

    const callbacks: StreamCallbacks = {
      onToken: () => { },
      onDone: () => { },
      onError: (error: Error) => { errorCaught = error; },
    };

    const messages: MessageContent[] = [{ role: 'user', content: 'Hi' }];
    generateCompletionStream(messages, baseConfig, callbacks);

    // Advance through all retry delays (1s + 2s = 3s) + processing
    await vi.advanceTimersByTimeAsync(3500);

    expect(errorCaught).not.toBeNull();
    expect(errorCaught!.message).toContain('API Error');

    vi.useRealTimers();
  });

  it('should support Ollama provider streaming', async () => {
    const ollamaConfig: LLMConfig = {
      ...baseConfig,
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
    };

    const chunks = [
      'data: {"message":{"content":"Hello"}}\n\n',
      'data: {"message":{"content":" from Ollama"}}\n\n',
      'data: [DONE]\n\n',
    ];

    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(chunks[0]) })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(chunks[1]) })
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(chunks[2]) })
        .mockResolvedValueOnce({ done: true }),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: { getReader: () => mockReader },
    });

    let finalText = '';

    const callbacks: StreamCallbacks = {
      onToken: () => { },
      onDone: (fullText: string) => { finalText = fullText; },
      onError: () => { },
    };

    const messages: MessageContent[] = [{ role: 'user', content: 'Hi' }];
    generateCompletionStream(messages, ollamaConfig, callbacks);

    await new Promise(r => setTimeout(r, 100));

    expect(finalText).toBe('Hello from Ollama');
  });
});
