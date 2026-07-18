import { GenerationRequest, LLMConfig } from '@/types';
import { fetchWithRetry } from './llm';

/**
 * Result of a generation request.
 */
export interface GenerationResult {
  success: boolean;
  /** URL or base64 data of the generated asset. */
  data?: string;
  /** MIME type of the generated asset. */
  mimeType?: string;
  /** Human-readable error message. */
  error?: string;
}

/**
 * Generate an image via the configured LLM provider's image API.
 *
 * Supports OpenAI-compatible image generation endpoints (DALL-E).
 * Falls back to Ollama's image generation if available.
 *
 * @param prompt  Text description of the desired image.
 * @param config  LLM provider settings (baseUrl, apiKey, model).
 * @returns       GenerationResult with base64 image data on success.
 */
export async function generateImage(
  prompt: string,
  config: LLMConfig
): Promise<GenerationResult> {
  try {
    let url = '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: Record<string, unknown> = {};

    if (config.provider === 'ollama') {
      // Ollama: use /api/generate with image-capable model
      url = `${config.baseUrl.replace(/\/$/, '')}/api/generate`;
      body = {
        model: config.model || 'llava',
        prompt: `Generate an image: ${prompt}`,
        stream: false,
      };
    } else {
      // OpenAI-compatible: /v1/images/generations
      let baseUrl = config.baseUrl.replace(/\/$/, '');
      if (!baseUrl.endsWith('/v1')) baseUrl += '/v1';
      url = `${baseUrl}/images/generations`;
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      body = {
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2min for image gen

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    }, 1);

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Image API Error: ${response.status} - ${errText}` };
    }

    const data = await response.json();

    if (config.provider === 'ollama') {
      // Ollama returns base64 images in the response field
      const images = data.images || (data.response ? extractBase64Images(data.response) : []);
      if (images.length > 0) {
        return { success: true, data: images[0], mimeType: 'image/png' };
      }
      return { success: false, error: 'No image data in Ollama response' };
    } else {
      // OpenAI format: data[0].b64_json or data[0].url
      if (data.data?.[0]?.b64_json) {
        return { success: true, data: data.data[0].b64_json, mimeType: 'image/png' };
      }
      if (data.data?.[0]?.url) {
        return { success: true, data: data.data[0].url, mimeType: 'image/png' };
      }
      return { success: false, error: 'No image data in API response' };
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return { success: false, error: 'Image generation timed out (120s)' };
    }
    return { success: false, error: `Image generation failed: ${String(error).slice(0, 200)}` };
  }
}

/**
 * Generate a video via the configured backend API.
 *
 * Uses a RunwayML-compatible or custom video generation endpoint.
 * Falls back to a placeholder for demo purposes.
 *
 * @param prompt  Text description of the desired video.
 * @param config  LLM provider settings.
 * @returns       GenerationResult with video URL or base64 on success.
 */
export async function generateVideo(
  prompt: string,
  config: LLMConfig
): Promise<GenerationResult> {
  try {
    // Video generation typically requires a dedicated service.
    // Try the configured baseUrl with a /v1/video/generations endpoint.
    let baseUrl = config.baseUrl.replace(/\/$/, '');
    if (!baseUrl.endsWith('/v1') && config.provider !== 'ollama') {
      baseUrl += '/v1';
    }

    const url = `${baseUrl}/video/generations`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const body = {
      model: 'gen-2',
      prompt,
      duration: 4,
      resolution: '720p',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5min for video gen

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    }, 1);

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Video API Error: ${response.status} - ${errText}` };
    }

    const data = await response.json();
    const videoUrl = data.output?.url || data.video_url || data.url;

    if (videoUrl) {
      return { success: true, data: videoUrl, mimeType: 'video/mp4' };
    }
    return { success: false, error: 'No video URL in API response' };
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return { success: false, error: 'Video generation timed out (300s)' };
    }
    return { success: false, error: `Video generation failed: ${String(error).slice(0, 200)}` };
  }
}

/**
 * Generate speech/audio via the configured TTS provider.
 *
 * Uses OpenAI-compatible /v1/audio/speech endpoint.
 *
 * @param text    Text to convert to speech.
 * @param config  LLM provider settings (ttsVoice, ttsSpeed, ttsModel).
 * @returns       GenerationResult with base64 audio data on success.
 */
export async function generateSpeech(
  text: string,
  config: LLMConfig
): Promise<GenerationResult> {
  try {
    let baseUrl = config.baseUrl.replace(/\/$/, '');
    if (!baseUrl.endsWith('/v1') && config.provider !== 'ollama') {
      baseUrl += '/v1';
    }

    const url = `${baseUrl}/audio/speech`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const body = {
      model: config.ttsModel || 'tts-1',
      input: text,
      voice: config.ttsVoice || 'alloy',
      speed: config.ttsSpeed || 1.0,
      response_format: 'mp3',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    }, 1);

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `TTS API Error: ${response.status} - ${errText}` };
    }

    // Audio response is binary
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    return { success: true, data: base64, mimeType: 'audio/mp3' };
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return { success: false, error: 'Speech generation timed out (60s)' };
    }
    return { success: false, error: `Speech generation failed: ${String(error).slice(0, 200)}` };
  }
}

// --- Helpers ---

/** Extract base64 image strings from raw text (Ollama multimodal response). */
function extractBase64Images(text: string): string[] {
  const results: string[] = [];
  // Match base64 data URIs
  const regex = /data:image\/\w+;base64,([A-Za-z0-9+/=]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    results.push(match[1]);
  }
  return results;
}

/** Convert a Blob to a base64 string. */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the data:... prefix
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Dispatch a generation request to the appropriate backend based on mode.
 *
 * @param request  Generation mode + prompt.
 * @param config   LLM provider settings.
 * @returns        GenerationResult.
 */
export async function dispatchGeneration(
  request: GenerationRequest,
  config: LLMConfig
): Promise<GenerationResult> {
  switch (request.mode) {
    case 'image':
      return generateImage(request.prompt, config);
    case 'video':
      return generateVideo(request.prompt, config);
    case 'audio':
      return generateSpeech(request.prompt, config);
    case 'text':
      // Text generation is handled directly via llm.ts
      return { success: false, error: 'Text generation should use generateCompletion directly' };
    default:
      return { success: false, error: `Unknown generation mode: ${(request as GenerationRequest).mode}` };
  }
}