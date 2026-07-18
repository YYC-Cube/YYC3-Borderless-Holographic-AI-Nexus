import { LLMConfig } from './llm';
import { Message } from '@/hooks/useAI';

export interface CloudState {
    config: LLMConfig;
    messages: Message[];
}

export interface SyncResponse {
    success: boolean;
    timestamp: number;
    data?: CloudState;
    message?: string;
    errorType?: 'network' | 'cors' | 'server' | 'mixed-content' | 'unknown';
}

/**
 * Default YYC³ cloud sync server.
 * Single source of truth — import this instead of hardcoding the URL.
 * Override at runtime via the "Cloud" tab in the ConfigPanel.
 */
export const DEFAULT_SERVER_URL = "http://8.152.195.33:7007";

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
        // Silent return for push
        return { success: false, timestamp: 0, message: "Mixed Content", errorType: 'mixed-content' };
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
            return { 
                success: false, 
                timestamp: 0, 
                message: `Server Error: ${response.status}`,
                errorType: 'server'
            };
        }
        return await response.json();
    } catch (e: unknown) {
        clearTimeout(timeoutId);
        // Only log actual network errors, not "Failed to fetch" which is expected in some envs
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
        // Silent return for pull
        return { success: false, timestamp: 0, message: "Mixed Content", errorType: 'mixed-content' };
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
            return { 
                success: false, 
                timestamp: 0, 
                message: `Server Error: ${response.status}`,
                errorType: 'server'
            };
        }
        return await response.json();
    } catch (e: unknown) {
        clearTimeout(timeoutId);
        if (!String(e).includes('Failed to fetch')) {
             console.warn("[Cloud Pull]", e);
        }
        return { success: false, message: String(e), timestamp: 0, errorType: 'network' };
    }
}
