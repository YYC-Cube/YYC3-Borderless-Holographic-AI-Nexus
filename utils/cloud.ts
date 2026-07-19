import { Message } from '@/hooks/useAI';
import { LLMConfig } from './llm';

export interface CloudState {
  config: LLMConfig;
  messages: Message[];
}

export interface SyncResponse {
  success: boolean;
  timestamp: number;
  data?: CloudState;
  message?: string;
  errorType?: 'network' | 'cors' | 'server' | 'mixed-content' | 'circuit-open' | 'unknown';
}

/**
 * Default YYC³ cloud sync server.
 * Single source of truth — import this instead of hardcoding the URL.
 * Override at runtime via the "Cloud" tab in the ConfigPanel.
 */
export const DEFAULT_SERVER_URL = "http://8.152.195.33:7007";

// ============================================================
// Circuit breaker — after MAX_CONSECUTIVE_FAILURES in a row,
// stop attempting syncs for the rest of the page session to
// avoid noisy `net::ERR_ABORTED` logs from unreachable servers.
// Resets on page reload or a successful round-trip.
// ============================================================
const MAX_CONSECUTIVE_FAILURES = 2;
let consecutiveFailures = 0;

function isCircuitOpen(): boolean {
  return consecutiveFailures >= MAX_CONSECUTIVE_FAILURES;
}

function recordSyncResult(success: boolean): void {
  if (success) {
    consecutiveFailures = 0;
  } else {
    consecutiveFailures++;
  }
}

/**
 * Detect whether a request from the current page to `targetUrl` would be
 * blocked by the browser as Mixed Content (HTTPS page → HTTP target).
 *
 * @param targetUrl The absolute URL to test. Falsy values return `false`.
 * @returns         `true` if the request would be blocked; `false` otherwise.
 *                  Also returns `false` outside a browser (SSR-safe).
 */
export function isMixedContent(targetUrl?: string): boolean {
  if (!targetUrl) return false;
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:' && targetUrl.toLowerCase().startsWith('http:');
}

/**
 * Push the current app state (config + messages) to the YYC³ sync server.
 *
 * POSTs `{ userId, payload, timestamp }` to `{url}/api/sync` with a 5s
 * timeout. Silently no-ops on Mixed Content violations (HTTPS → HTTP).
 *
 * @param url    Sync server base URL. Falls back to `DEFAULT_SERVER_URL` if empty.
 * @param userId Stable per-browser user id (see `yyc_uid` in `useAI`).
 * @param data   The cloud state to push.
 * @returns      Structured `SyncResponse`. Network failures set `errorType: 'network'`.
 */
export async function syncPush(url: string, userId: string, data: CloudState): Promise<SyncResponse> {
  const targetUrl = url || DEFAULT_SERVER_URL;

  if (isMixedContent(targetUrl)) {
    return { success: false, timestamp: 0, message: "Mixed Content", errorType: 'mixed-content' };
  }

  if (isCircuitOpen()) {
    return { success: false, timestamp: 0, message: "Circuit breaker open", errorType: 'circuit-open' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${targetUrl.replace(/\/$/, '')}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        payload: data,
        timestamp: Date.now()
      }),
      signal: controller.signal,
      mode: 'cors'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      recordSyncResult(false);
      return {
        success: false,
        timestamp: 0,
        message: `Server Error: ${response.status}`,
        errorType: 'server'
      };
    }
    const result = await response.json();
    recordSyncResult(true);
    return result;
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    recordSyncResult(false);
    // AbortError from timeout is expected — silently handle it
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { success: false, message: 'Request timed out', timestamp: 0, errorType: 'network' };
    }
    if (!String(e).includes('Failed to fetch')) {
      console.warn("[Cloud Push]", e);
    }
    return { success: false, message: String(e), timestamp: 0, errorType: 'network' };
  }
}

/**
 * Pull the latest synced app state from the YYC³ sync server.
 *
 * GETs `{url}/api/sync?userId=<id>` with a 5s timeout. Silently no-ops
 * on Mixed Content violations (HTTPS → HTTP).
 *
 * @param url    Sync server base URL. Falls back to `DEFAULT_SERVER_URL` if empty.
 * @param userId Stable per-browser user id (see `yyc_uid` in `useAI`).
 * @returns      `SyncResponse` with `.data` populated on success.
 */
export async function syncPull(url: string, userId: string): Promise<SyncResponse> {
  const targetUrl = url || DEFAULT_SERVER_URL;

  if (isMixedContent(targetUrl)) {
    return { success: false, timestamp: 0, message: "Mixed Content", errorType: 'mixed-content' };
  }

  if (isCircuitOpen()) {
    return { success: false, timestamp: 0, message: "Circuit breaker open", errorType: 'circuit-open' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${targetUrl.replace(/\/$/, '')}/api/sync?userId=${userId}`, {
      signal: controller.signal,
      mode: 'cors'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      recordSyncResult(false);
      return {
        success: false,
        timestamp: 0,
        message: `Server Error: ${response.status}`,
        errorType: 'server'
      };
    }
    const result = await response.json();
    recordSyncResult(true);
    return result;
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    recordSyncResult(false);
    // AbortError from timeout is expected — silently handle it
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { success: false, message: 'Request timed out', timestamp: 0, errorType: 'network' };
    }
    if (!String(e).includes('Failed to fetch')) {
      console.warn("[Cloud Pull]", e);
    }
    return { success: false, message: String(e), timestamp: 0, errorType: 'network' };
  }
}
