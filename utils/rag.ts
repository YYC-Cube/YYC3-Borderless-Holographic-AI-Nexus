import { LLMConfig } from './llm';

// Simple cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Memory Entry Interface
export interface MemoryEntry {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  embedding?: number[];
  timestamp: number;
}

// --- LRU Embedding Cache ---
const MAX_CACHE_SIZE = 100;
const embeddingCache = new Map<string, number[]>();

/**
 * Clear the embedding cache (useful for testing or config changes).
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}

/**
 * Get the current size of the embedding cache.
 */
export function getEmbeddingCacheSize(): number {
  return embeddingCache.size;
}

/**
 * Generate an embedding vector for the given text using the configured provider.
 *
 * Routes to `/api/embeddings` (Ollama, using `model` + `prompt`) or `/v1/embeddings`
 * (OpenAI / DeepSeek, using the hardcoded `text-embedding-3-small` model). Returns
 * `null` for unsupported providers, on HTTP errors, or for "Failed to fetch"
 * network errors (silenced to avoid log spam).
 *
 * @param text   The input text to embed.
 * @param config LLM provider settings.
 * @returns      Embedding vector on success; `null` on any failure.
 */
export async function getEmbedding(text: string, config: LLMConfig): Promise<number[] | null> {
  // Check LRU cache first
  const cacheKey = `${config.provider}:${text}`;
  if (embeddingCache.has(cacheKey)) {
    // Move to end (most recently used) by re-inserting
    const cached = embeddingCache.get(cacheKey)!;
    embeddingCache.delete(cacheKey);
    embeddingCache.set(cacheKey, cached);
    return cached;
  }

  try {
    let url = '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: Record<string, unknown> = {};

    if (config.provider === 'ollama') {
      url = `${config.baseUrl.replace(/\/$/, '')}/api/embeddings`;
      body = { model: config.model, prompt: text }; // Ollama uses 'prompt'
    } else if (config.provider === 'openai' || config.provider === 'deepseek') {
      let baseUrl = config.baseUrl.replace(/\/$/, '');
      if (!baseUrl.endsWith('/v1')) baseUrl += '/v1';
      url = `${baseUrl}/embeddings`;
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      body = { input: text, model: 'text-embedding-3-small' }; // Default to a common embedding model
    } else {
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();

    let result: number[] | null = null;
    if (config.provider === 'ollama') {
      result = data.embedding;
    } else {
      result = data.data?.[0]?.embedding || null;
    }

    // Store in LRU cache
    if (result) {
      if (embeddingCache.size >= MAX_CACHE_SIZE) {
        // Evict oldest (first key in Map)
        const firstKey = embeddingCache.keys().next().value;
        if (firstKey) embeddingCache.delete(firstKey);
      }
      embeddingCache.set(cacheKey, result);
    }

    return result;
  } catch (e) {
    // Silently fail for embeddings to prevent log spam during "Failed to fetch" scenarios
    // Only log if it's NOT a mixed content / network error which we expect in some envs
    const errStr = String(e);
    if (!errStr.includes('Failed to fetch') && !errStr.includes('NetworkError')) {
      console.warn("[RAG] Embedding failed:", e);
    }
    return null;
  }
}

/**
 * Retrieve the top-K most relevant memories for the query via cosine similarity.
 *
 * Short-circuits with an empty string until at least 5 memories have been
 * archived (see `useAI.archiveMemory`). Returns formatted context text meant
 * to be appended to the user's message before LLM submission.
 *
 * @param query    The user's current input.
 * @param memories All archived memories (only those with embeddings are scored).
 * @param config   LLM provider settings (used to embed the query).
 * @param topK     Max memories to return. Default `3`.
 * @returns        A formatted context block, or `""` if no useful context was found.
 */
export async function retrieveContext(
  query: string,
  memories: MemoryEntry[],
  config: LLMConfig,
  topK: number = 3
): Promise<string> {
  // If no memories or not enough data, return empty
  if (memories.length < 5) return "";

  // Generate embedding for query
  const queryEmbedding = await getEmbedding(query, config);
  if (!queryEmbedding) return "";

  // Calculate similarities
  const scoredMemories = memories
    .filter(m => m.embedding) // Only those with embeddings
    .map(m => ({
      ...m,
      score: cosineSimilarity(queryEmbedding, m.embedding!)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (scoredMemories.length === 0) return "";

  console.log(`[RAG] Found ${scoredMemories.length} relevant memories.`);

  const contextText = scoredMemories
    .map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role}: ${m.content}`)
    .join('\n');

  return `\n\nRelevant Context from Memory:\n${contextText}\n\n`;
}
