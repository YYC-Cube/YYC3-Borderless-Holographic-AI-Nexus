import { LLMConfig } from '@/utils/llm';
import { clearEmbeddingCache, getEmbedding, getEmbeddingCacheSize, MemoryEntry, retrieveContext } from '@/utils/rag';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockEmbeddingResponse(embedding: number[]) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: [{ embedding }] }),
  });
}

function mockEmbeddingFailure() {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    json: () => Promise.resolve({}),
  });
}

function mockNetworkError() {
  mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));
}

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

describe('getEmbedding', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    clearEmbeddingCache();
  });

  it('should return an embedding vector on success', async () => {
    const expectedEmbedding = Array(1536).fill(0).map((_, i) => i * 0.001);
    mockEmbeddingResponse(expectedEmbedding);

    const result = await getEmbedding('hello world', baseConfig);
    expect(result).toEqual(expectedEmbedding);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should return null on HTTP error', async () => {
    mockEmbeddingFailure();

    const result = await getEmbedding('test', baseConfig);
    expect(result).toBeNull();
  });

  it('should return null on network error', async () => {
    mockNetworkError();

    const result = await getEmbedding('test', baseConfig);
    expect(result).toBeNull();
  });

  it('should return null for unsupported providers', async () => {
    const result = await getEmbedding('test', { ...baseConfig, provider: 'moonshot' });
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should cache embeddings and return cached results', async () => {
    const expectedEmbedding = [0.1, 0.2, 0.3];
    mockEmbeddingResponse(expectedEmbedding);

    // First call: should hit the API
    const result1 = await getEmbedding('hello', baseConfig);
    expect(result1).toEqual(expectedEmbedding);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(getEmbeddingCacheSize()).toBe(1);

    // Second call with same text: should hit cache, not API
    const result2 = await getEmbedding('hello', baseConfig);
    expect(result2).toEqual(expectedEmbedding);
    expect(mockFetch).toHaveBeenCalledTimes(1); // No additional call
    expect(getEmbeddingCacheSize()).toBe(1);
  });

  it('should differentiate cache keys by provider', async () => {
    const emb1 = [0.1, 0.2];
    const emb2 = [0.3, 0.4];
    mockEmbeddingResponse(emb1);
    mockEmbeddingResponse(emb2);

    await getEmbedding('test', baseConfig);
    await getEmbedding('test', { ...baseConfig, provider: 'deepseek' });

    expect(getEmbeddingCacheSize()).toBe(2);
  });

  it('should evict oldest entry when cache exceeds max size', async () => {
    // Fill cache beyond 100 entries
    const maxSize = 100;
    for (let i = 0; i < maxSize + 5; i++) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [{ embedding: [i] }] }),
      });
      await getEmbedding(`text_${i}`, baseConfig);
    }

    expect(getEmbeddingCacheSize()).toBe(maxSize);
    // The first entry should be evicted; re-fetching it should call API again
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [{ embedding: [999] }] }),
    });
    const firstEntry = await getEmbedding('text_0', baseConfig);
    expect(firstEntry).toEqual([999]);
  });

  it('should clear cache properly', async () => {
    mockEmbeddingResponse([0.1]);
    await getEmbedding('test', baseConfig);
    expect(getEmbeddingCacheSize()).toBe(1);

    clearEmbeddingCache();
    expect(getEmbeddingCacheSize()).toBe(0);
  });
});

describe('retrieveContext', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    clearEmbeddingCache();
  });

  it('should return empty string when memories are less than 5', async () => {
    const memories: MemoryEntry[] = [
      { id: '1', content: 'hello', role: 'user', timestamp: Date.now() },
    ];
    const result = await retrieveContext('query', memories, baseConfig);
    expect(result).toBe('');
  });

  it('should return empty string when query embedding fails', async () => {
    mockNetworkError();
    const memories: MemoryEntry[] = Array(5).fill(null).map((_, i) => ({
      id: String(i),
      content: `memory ${i}`,
      role: 'user' as const,
      timestamp: Date.now() - i * 1000,
      embedding: [0.1 * i, 0.2 * i, 0.3 * i],
    }));
    const result = await retrieveContext('query', memories, baseConfig);
    expect(result).toBe('');
  });

  it('should return context text when relevant memories found', async () => {
    // Mock embedding for the query
    mockEmbeddingResponse([0.5, 0.5, 0.5]);

    const memories: MemoryEntry[] = Array(5).fill(null).map((_, i) => ({
      id: String(i),
      content: `This is memory number ${i}`,
      role: i % 2 === 0 ? 'user' as const : 'assistant' as const,
      timestamp: Date.now() - i * 10000,
      embedding: [0.1 * i, 0.2 * i, 0.3 * i],
    }));
    const result = await retrieveContext('find me relevant info', memories, baseConfig);
    expect(result).not.toBe('');
    expect(result).toContain('Relevant Context from Memory');
  });
});
