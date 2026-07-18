
// 增加 UI 控制指令说明
const UI_CONTROL_PROMPT = `
作为全息魔方的控制核心，你可以通过在回复末尾附加指令来控制界面。
可用指令格式：[[CMD:指令名]]
支持的指令：
- [[CMD:OPEN_SETTINGS]] : 打开设置面板
- [[CMD:OPEN_HISTORY]] : 打开历史记录
- [[CMD:CLOSE_PANEL]] : 关闭所有面板
- [[CMD:THEME_RED]] : 切换为红色警戒模式
- [[CMD:THEME_CYAN]] : 切换为青色默认模式

例如，当用户说“打开设置”时，请回复：“已为您调出神经中枢面板。[[CMD:OPEN_SETTINGS]]”
`;

import { LLMConfig, MessageContent } from '@/types';
import { validateLLMConfig, validateMessages } from './validation';

export const DEFAULT_CONFIG: LLMConfig = {
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
  apiKey: '',
  model: 'llama3',
  systemPrompt: '你是言语云（YanYuCloud）的智能助手，一个存在于全息魔方中的数字生命。请用简洁、富有科技感和哲学深度的语言回答用户。' + UI_CONTROL_PROMPT,
  ttsProvider: 'browser',
  ttsModel: 'tts-1',
  ttsVoice: 'alloy',
  ttsSpeed: 1.0
};

export type { LLMConfig, MessageContent };

// 模拟回复生成器（当API无法连接时使用）
const MOCK_RESPONSES = [
  "正在校准神经元连接... 检测到本地环境限制。这是来自言语云魔方的模拟信号。",
  "维度数据传输中... 您的语音指令清晰可辨。在正式环境中，我将通过 Ollama 或云端 API 返回真实运算结果。",
  "系统核心运转正常。您刚才提到的概念非常有趣，正如《黑客帝国》中所言，一切皆为信息流。",
  "检测到情感波动。虽然我只是原型机，但我能感受到您对未来的期待。"
];

/**
 * Send a chat completion request to the configured LLM provider.
 *
 * Auto-appends the `UI_CONTROL_PROMPT` block (if not already present) so the
 * assistant can drive the UI via `[[CMD:...]]` tokens. Falls back to demo /
 * mock mode on network errors or mixed-content blocks — never throws.
 *
 * @param messages  Conversation turns (most recent last). System prompt is auto-prepended.
 * @param config    LLM provider settings. `provider`, `baseUrl`, `apiKey`, `model` are required.
 * @returns         The assistant's reply text, with `[[CMD:...]]` tokens still embedded
 *                  (the caller is responsible for parsing via `useAI.parseAndExecuteCommands`).
 */
export async function generateCompletion(
  messages: MessageContent[],
  config: LLMConfig
): Promise<string> {
  // 1. 参数验证
  const configCheck = validateLLMConfig(config);
  if (!configCheck.valid) {
    throw new Error(`Configuration Error: ${configCheck.error}`);
  }

  const msgCheck = validateMessages(messages);
  if (!msgCheck.valid) {
    throw new Error(`Message Error: ${msgCheck.error}`);
  }

  // 插入系统提示词 (如果没有被用户覆盖，则追加 UI 控制指令)
  let sysPrompt = config.systemPrompt || DEFAULT_CONFIG.systemPrompt;
  if (!sysPrompt?.includes('[[CMD:')) {
    sysPrompt += UI_CONTROL_PROMPT;
  }

  const fullMessages: MessageContent[] = [
    { role: 'system', content: sysPrompt! },
    ...messages
  ];

  try {
    if (!config.baseUrl) {
      console.warn("[LLM] config.baseUrl is missing, using default.");
      config.baseUrl = DEFAULT_CONFIG.baseUrl;
    }

    let url = '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    let body: Record<string, unknown> = {};

    // 2. 构建请求
    if (config.provider === 'ollama') {
      // Ollama API
      url = `${config.baseUrl.replace(/\/$/, '')}/api/chat`;

      // Ollama expects images inside the message object
      const ollamaMessages = fullMessages.map(m => ({
        role: m.role,
        content: m.content,
        images: m.images || undefined // Optional: Array of Base64 strings
      }));

      body = {
        model: config.model,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: config.temperature,
          top_p: config.topP,
          num_predict: config.maxTokens
        }
      };
    } else {
      // OpenAI Compatible (DeepSeek, Moonshot, etc.)
      let baseUrl = config.baseUrl.replace(/\/$/, '');
      if (!baseUrl.endsWith('/v1')) baseUrl += '/v1';

      url = `${baseUrl}/chat/completions`;
      headers['Authorization'] = `Bearer ${config.apiKey}`;

      // Transform for OpenAI Vision format if images exist
      const openAiMessages = fullMessages.map(m => {
        if (!m.images || m.images.length === 0) {
          return { role: m.role, content: m.content };
        }
        // Construct Vision Content Array
        return {
          role: m.role,
          content: [
            { type: "text", text: m.content },
            ...m.images.map(img => ({
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${img}` }
            }))
          ]
        };
      });

      body = {
        model: config.model,
        messages: openAiMessages,
        temperature: config.temperature ?? 0.7,
        top_p: config.topP ?? 1.0,
        max_tokens: config.maxTokens
      };
    }

    console.log(`[LLM] Requesting ${config.provider} at ${url}`);

    // 3. 发起请求
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased timeout for slow local models

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    }, 2);

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    // 4. 解析响应
    if (config.provider === 'ollama') {
      return data.message?.content || "Ollama 返回了空内容";
    } else {
      return data.choices?.[0]?.message?.content || "API 返回了空内容";
    }

  } catch (error) {
    // Silenced error log to reduce noise for "Failed to fetch"
    const isMixedContent = String(error).includes('Failed to fetch') && window.location.protocol === 'https:';

    if (isMixedContent) {
      console.log("[LLM] Fallback: Mixed Content prevented request to insecure API.");
      return `[安全模式] 浏览器已拦截对不安全API (${config.baseUrl}) 的请求。请使用支持 HTTPS 的 API 或在设置面板中查看帮助。\n\n(模拟回复) ${MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]}`;
    } else {
      console.warn("[LLM] API Call Failed, falling back to Mock:", error);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return `[演示模式/离线] 连接 ${config.provider} 失败。原因：${error instanceof Error ? error.message : String(error)}\n\n(模拟回复) ${MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]}`;
    }
  }
}

// 5. 流式响应 (Streaming SSE)

/**
 * Streaming completion callback interface.
 * Called for each chunk of text as it arrives from the LLM.
 */
export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
}

/**
 * Send a streaming chat completion request to the configured LLM provider.
 *
 * Supports SSE (Server-Sent Events) for Ollama and OpenAI-compatible providers.
 * Falls back to non-streaming mode if the provider doesn't support streaming.
 *
 * @param messages   Conversation turns. System prompt is auto-prepended.
 * @param config     LLM provider settings.
 * @param callbacks  Streaming callbacks for token-by-token updates.
 * @returns          The AbortController for cancellation.
 */
export function generateCompletionStream(
  messages: MessageContent[],
  config: LLMConfig,
  callbacks: StreamCallbacks
): AbortController {
  const controller = new AbortController();

  // Build full messages with system prompt
  let sysPrompt = config.systemPrompt || DEFAULT_CONFIG.systemPrompt;
  if (!sysPrompt?.includes('[[CMD:')) {
    sysPrompt += UI_CONTROL_PROMPT;
  }
  const fullMessages: MessageContent[] = [
    { role: 'system', content: sysPrompt! },
    ...messages
  ];

  (async () => {
    try {
      // Validate
      let url = '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let body: Record<string, unknown> = {};

      if (config.provider === 'ollama') {
        url = `${(config.baseUrl || DEFAULT_CONFIG.baseUrl).replace(/\/$/, '')}/api/chat`;
        const ollamaMessages = fullMessages.map(m => ({
          role: m.role,
          content: m.content,
          images: m.images || undefined
        }));
        body = {
          model: config.model,
          messages: ollamaMessages,
          stream: true,
          options: {
            temperature: config.temperature,
            top_p: config.topP,
            num_predict: config.maxTokens
          }
        };
      } else {
        let baseUrl = (config.baseUrl || '').replace(/\/$/, '');
        if (!baseUrl.endsWith('/v1')) baseUrl += '/v1';
        url = `${baseUrl}/chat/completions`;
        headers['Authorization'] = `Bearer ${config.apiKey}`;

        const openAiMessages = fullMessages.map(m => {
          if (!m.images || m.images.length === 0) {
            return { role: m.role, content: m.content };
          }
          return {
            role: m.role,
            content: [
              { type: "text", text: m.content },
              ...m.images.map(img => ({
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${img}` }
              }))
            ]
          };
        });

        body = {
          model: config.model,
          messages: openAiMessages,
          stream: true,
          temperature: config.temperature ?? 0.7,
          top_p: config.topP ?? 1.0,
          max_tokens: config.maxTokens
        };
      }

      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      }, 2);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body stream available');
      }

      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            let token = '';

            if (config.provider === 'ollama') {
              token = parsed.message?.content || '';
            } else {
              token = parsed.choices?.[0]?.delta?.content || '';
            }

            if (token) {
              fullText += token;
              callbacks.onToken(token);
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      callbacks.onDone(fullText);
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      callbacks.onError(error as Error);
    }
  })();

  return controller;
}

// 6. 重试机制

/**
 * Fetch with automatic retry on transient failures.
 *
 * Retries on network errors and 5xx status codes with exponential backoff.
 * Does NOT retry on 4xx errors (client errors like bad request) or AbortError
 * (user-initiated cancellation).
 *
 * @param url      Request URL.
 * @param options  Fetch options.
 * @param retries  Max retry attempts (default 2).
 * @returns        Fetch Response.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      // Only retry on server errors (5xx)
      if (response.ok || response.status < 500 || i === retries) {
        return response;
      }
      console.warn(`[LLM] Retry ${i + 1}/${retries} after status ${response.status}`);
    } catch (error) {
      // Do NOT retry on AbortError (user cancelled)
      if ((error as Error).name === 'AbortError') throw error;
      if (i === retries) throw error;
      console.warn(`[LLM] Retry ${i + 1}/${retries} after error: ${String(error).slice(0, 100)}`);
    }
    // Exponential backoff: 1s, 2s
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  throw new Error('Max retries exceeded');
}

// 7. 检查连接 (原有)

// Check Connection Function
/**
 * Probe whether the configured LLM endpoint is reachable.
 *
 * Pings `/api/tags` (Ollama) or `/v1/models` (OpenAI-compatible) with a 5s
 * timeout. If listing models is blocked, falls back to a 1-token completion
 * request to confirm write access.
 *
 * @param config LLM provider settings.
 * @returns `{ success, latency (ms), message? }`. Never throws.
 */
export async function checkConnection(config: LLMConfig): Promise<{ success: boolean; latency: number; message?: string }> {
  const start = performance.now();
  try {
    let url = config.baseUrl.replace(/\/$/, '');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.provider !== 'ollama' && config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    // Determine probe URL based on provider
    let probeUrl = '';
    if (config.provider === 'ollama') {
      probeUrl = `${url}/api/tags`; // Ollama list models endpoint
    } else {
      if (!url.endsWith('/v1')) url += '/v1';
      probeUrl = `${url}/models`; // OpenAI compatible list models endpoint
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for ping

    const response = await fetch(probeUrl, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Some providers might block GET /models but allow chat, retry with a minimal chat completion
      throw new Error(`Status: ${response.status}`);
    }

    const end = performance.now();
    return { success: true, latency: Math.round(end - start) };

  } catch (error) {
    // Fallback: Try a minimal completion request if /models fails (some providers restrict listing models)
    try {
      // Using a separate try-catch for the fallback
      const startFallback = performance.now();
      await generateCompletion([{ role: 'user', content: 'hi' }], { ...config, maxTokens: 1 });
      const endFallback = performance.now();
      return { success: true, latency: Math.round(endFallback - startFallback) };
    } catch (_e) {
      return { success: false, latency: 0, message: String(error) };
    }
  }
}


/**
 * Synthesize speech via the OpenAI-compatible TTS endpoint.
 *
 * Uses `config.ttsModel` (default `tts-1`), `config.ttsVoice` (default `alloy`),
 * and `config.ttsSpeed` (default `1.0`). The base URL is normalized to `/v1`
 * before appending `/audio/speech`.
 *
 * @param text   The text to synthesize.
 * @param config LLM/TTS settings. Must include a valid `apiKey` for OpenAI.
 * @returns      Raw audio bytes (ArrayBuffer) ready to be wrapped in a Blob URL.
 * @throws       {Error} On non-2xx responses (caller should catch).
 */
export async function fetchOpenAITTS(text: string, config: LLMConfig): Promise<ArrayBuffer> {
  const safeBaseUrl = config.baseUrl || DEFAULT_CONFIG.baseUrl;
  const baseUrl = safeBaseUrl.replace(/\/chat\/completions$/, '').replace(/\/v1$/, '') + '/v1';
  const url = `${baseUrl}/audio/speech`;

  console.log("[TTS] Requesting OpenAI TTS:", url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.ttsModel || 'tts-1',
      input: text,
      voice: config.ttsVoice || 'alloy',
      speed: config.ttsSpeed || 1.0
    })
  });

  if (!response.ok) {
    throw new Error(`TTS Error: ${response.statusText}`);
  }

  return await response.arrayBuffer();
}
