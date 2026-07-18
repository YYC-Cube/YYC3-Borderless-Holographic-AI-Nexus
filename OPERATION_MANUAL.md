# YanYu Intelligence Cloud³ (YYC³) — Operation Manual

**Version:** 7.4  
**Status:** PROD  
**Date:** 2026-07-18

---

## 1. System Overview

**YanYu Intelligence Cloud³ (YYC³)** is a next-generation AI assistant designed with a "Zero UI" philosophy. It abandons traditional navigation bars in favor of spatial gestures and holographic interactions. The core of the system is the **Responsive Cube**, a sentient visual interface that reacts to voice, touch, and data streams.

---

## 2. Gesture Navigation System (Spatial Controls)

### Basic Interactions

| Gesture | Action | Description |
|:---|:---|:---|
| **Tap (Cube)** | Toggle Listening | Starts or stops the voice recognition system. |
| **Double Tap** | Orbital Menu | Opens the quick-access circular menu for core tools. |
| **Long Press (600ms)** | Voice Mode | Hold anywhere on the screen to activate voice input. |

### Directional Swipes (Threshold: 60px)

| Direction | Module | Function |
|:---|:---|:---|
| **Swipe Up** | Terminal Nexus | Opens the text/voice/file command center. |
| **Swipe Down** | Memory Stream | View chat history and session logs. |
| **Swipe Left** | Intelligent Center | Opens the holographic dashboard (7 nodes). |
| **Swipe Right** | Settings Panel | Configure AI provider, model, voice, role. |
| **Swipe Down-Right** | Task Pod | Borderless task management (voice + gestures). |
| **Swipe Down-Left** | Debate Matrix | Multi-role AI debate. |
| **Swipe Up-Right** | Reset Session | Clears current conversation. |
| **Swipe Up-Left** | Theme Toggle | Switch between Cyan (default) and Red (alert) themes. |

### Task Gestures

| Gesture | Action |
|:---|:---|
| **Swipe Left (on task)** | Delete task |
| **Swipe Right (on task)** | Complete task |
| **Swipe Down (on panel)** | Close panel |

---

## 3. Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| `ESC` | Close current panel |
| `Ctrl+K` | Command search |
| `Ctrl+,` | Open settings |
| `Ctrl+H` | History panel |
| `Ctrl+Shift+T` | Toggle theme |

---

## 4. AI Configuration

### Supported Providers

| Provider | Endpoint | Models |
|:---|:---|:---|
| Ollama | `/api/chat` | Llama 3, Mistral, etc. (local) |
| OpenAI | `/v1/chat/completions` | GPT-4o, GPT-4o-mini |
| DeepSeek | `/v1/chat/completions` | DeepSeek-V3, Coder |
| Moonshot | `/v1/chat/completions` | moonshot-v1 |
| Zhipu | `/v1/chat/completions` | GLM-4 |
| Yi | `/v1/chat/completions` | yi-large |
| Anthropic | `/v1/chat/completions` | Claude 3.5 Sonnet |
| Custom | 自定义 | Any OpenAI-compatible endpoint |

### AI Command System

The AI can control the UI via `[[CMD:...]]` tokens embedded in responses:

| Command | Effect |
|:---|:---|
| `[[CMD:OPEN_SETTINGS]]` | Opens settings panel |
| `[[CMD:OPEN_HISTORY]]` | Opens history panel |
| `[[CMD:THEME_RED]]` | Switches to red alert theme |
| `[[CMD:THEME_CYAN]]` | Switches to cyan default theme |

---

## 5. Voice Interaction

### Speech Recognition (STT)
- **Trigger**: Long press (600ms) anywhere on screen.
- **Supported**: Chinese (zh-CN) and English (en-US).
- **Fallback**: Auto-switches to text input if permission denied or unsupported.

### Speech Synthesis (TTS)
- **Dual Engine**: Browser Native TTS + OpenAI TTS.
- **Audio Visualization**: Real-time waveform via Web Audio API (`VoiceVisualizer`).

---

## 6. Multi-Modal Generation

Access via: Orbital Menu → Generator

| Mode | Status | Description |
|:---|:---|:---|
| **Text** | Real API | Uses configured LLM provider |
| **Image** | Real API | Backend generation endpoint |
| **Audio** | Real API | OpenAI TTS integration |
| **Video** | Real API | RunwayML-compatible endpoint |

---

## 7. Character System

| Character | Theme | Personality |
|:---|:---|:---|
| **YYC-01** | Cyan | Default assistant, helpful and intelligent |
| **Luna** | Cyan | Creative, empathetic companion |
| **HAL-9000** | Red | Tactical, analytical, direct |

**Debate Mode**: Two AI characters can debate a topic simultaneously (accessible via Orbital Menu).

---

## 8. Cloud Sync

- **Push**: Auto-saves config and history to cloud (5s debounce).
- **Pull**: Auto-loads on startup (1s delay).
- **Mixed Content**: Auto-detects HTTPS→HTTP and degrades gracefully.

---

## 9. Troubleshooting

| Issue | Solution |
|:---|:---|
| **No voice input** | Check browser microphone permissions. Web Speech API works best in Chrome/Edge. |
| **Ollama no response** | Ensure Ollama is running with `OLLAMA_ORIGINS="*" ollama serve`. |
| **API connection failed** | Check network, API key, and endpoint URL. Falls back to demo mode if offline. |
| **HTTPS mixed content** | See `HTTPS_GUIDE.md` for ngrok tunnel setup. |
| **Build failure** | Run `pnpm typecheck` first to verify types. Run `pnpm install` to ensure deps. |

---

*YYC³ — 言启千行代码，语枢万物智能*