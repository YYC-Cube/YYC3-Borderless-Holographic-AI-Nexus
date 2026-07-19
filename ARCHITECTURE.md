# YYC³ Architecture

> 系统架构可视化与数据流设计文档

---

## 概览

YYC³ 采用分层架构设计，从用户输入层到视觉反馈层形成完整的闭环链路。核心设计理念是 **Zero UI** — 去界面化交互，通过手势、语音和键盘作为输入，以 3D 视觉和音频作为反馈。

---

## 系统架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           YYC³ 系统架构                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  INPUT LAYER (输入层)                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  Gesture     │  │  Voice       │  │  Keyboard                │   │
│  │  8-direction │  │  Web Speech  │  │  ESC/Ctrl+K/Ctrl+,/...   │   │
│  │  + LongPress │  │  API (STT)   │  │                          │   │
│  │  + DoubleTap │  │              │  │                          │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘   │
└─────────┼─────────────────┼──────────────────────┼───────────────────┘
          │                 │                      │
          └─────────────────┼──────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│  STATE LAYER (状态层)                                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  useUIState (useReducer)                                      │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────┐   │   │
│  │  │ Panels (10) │ │ Inspecting   │ │ Debate Status        │   │   │
│  │  │ showConfig  │ │ Artifact     │ │                      │   │   │
│  │  │ showHistory │ │              │ │                      │   │   │
│  │  │ ...         │ │              │ │                      │   │   │
│  │  └─────────────┘ └──────────────┘ └──────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│  HOOK LAYER (逻辑层)                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  useAI       │  │  useSpeech   │  │  useGaze                 │   │
│  │  ┌─────────┐ │  │  ┌─────────┐ │  │  Pointer tracking        │   │
│  │  │ Messages│ │  │  │ STT     │ │  └──────────────────────────┘   │
│  │  │ Memory  │ │  │  │ TTS     │ │                                 │
│  │  │ Cloud   │ │  │  │ Visual  │ │                                 │
│  │  │ Commands│ │  │  └─────────┘ │                                 │
│  │  └─────────┘ │  └──────────────┘                                 │
│  └──────────────┘                                                    │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐ │
│  │  useKeyboardShortcuts│  │  useGestureHandler                   │ │
│  │  Global key bindings │  │  Touch/Pointer events                │ │
│  └──────────────────────┘  └──────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│  ENGINE LAYER (引擎层)                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  LLM Engine  │  │  RAG Memory  │  │  Cloud Sync              │   │
│  │  ┌─────────┐ │  │  ┌─────────┐ │  │  ┌────────────────────┐  │   │
│  │  │ 8 Prov. │ │  │  │Embedding│ │  │  │ Push/Pull          │  │   │
│  │  │ Stream  │ │  │  │Cosine   │ │  │  │ Diff Detection     │  │   │
│  │  │ Retry   │ │  │  │LRU Cache│ │  │  │ Conflict Resolve   │  │   │
│  │  │ Fallback│ │  │  └─────────┘ │  │  └────────────────────┘  │   │
│  │  └─────────┘ │  └──────────────┘  └──────────────────────────┘   │
│  └──────────────┘                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  DAG Engine  │  │  Generation  │  │  Character System        │   │
│  │  ┌─────────┐ │  │  ┌─────────┐ │  │  ┌────────────────────┐  │   │
│  │  │TopoSort │ │  │  │Text     │ │  │  │ YYC-01 / Luna      │  │   │
│  │  │CycleDet │ │  │  │Image    │ │  │  │ HAL-9000           │  │   │
│  │  │Execute  │ │  │  │Audio    │ │  │  │ Preset System      │  │   │
│  │  └─────────┘ │  │  │Video    │ │  │  └────────────────────┘  │   │
│  └──────────────┘  │  └─────────┘ │  └──────────────────────────┘   │
│                     └──────────────┘                                 │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│  COMPONENT LAYER (组件层)                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  CubeVisual  │  │  GlobeVisual │  │  VoiceVisualizer         │   │
│  │  3D Cube     │  │  Particles   │  │  Waveform                │   │
│  │  Color by    │  │  Globe       │  │  Bars                    │   │
│  │  AI State    │  │  Rotation    │  │                          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  ConfigPanel │  │  Terminal    │  │  DebateOverlay           │   │
│  │  Model/API   │  │  Panel       │  │  Multi-role Matrix       │   │
│  │  Voice/Cloud │  │  Text Input  │  │                          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  OrbitalMenu │  │  AIGenerator │  │  IntelligentCenter       │   │
│  │  Radial Nav  │  │  Panel       │  │  Dashboard               │   │
│  │              │  │  4 Modes     │  │  7 Nodes                 │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  TaskPod     │  │  Workflow    │  │  MCP Server              │   │
│  │  Todo List   │  │  Editor      │  │  Manager                 │   │
│  │              │  │  DAG Visual  │  │  3 Protocols             │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│  FOUNDATION LAYER (基础层)                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  shadcn/ui (48 components) + Radix UI (28 primitives)        │   │
│  │  Tailwind CSS v4 · Motion (Framer) · Lucide Icons            │   │
│  │  WAI-ARIA · Keyboard Navigation · Dark Mode · i18n           │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 数据流

### AI 对话流程

```
用户输入
    │
    ▼
ResponsiveAIAssistant (主控制器)
    │
    ├──► useAI.processMessage(userInput)
    │       │
    │       ├──► validation.ts (输入验证)
    │       │       ├── 长度检查 (max 500 chars)
    │       │       ├── XSS 过滤
    │       │       └── 敏感词检测
    │       │
    │       ├──► rag.ts.retrieveRelevant(userInput)
    │       │       ├── Embedding 生成 (多提供商)
    │       │       ├── 余弦相似度计算
    │       │       └── LRU 缓存 (100 条)
    │       │
    │       ├──► llm.ts.chat(messages, provider, model)
    │       │       ├── 提供商路由 (8 提供商)
    │       │       ├── 流式响应 (SSE ReadableStream)
    │       │       ├── 非流式 fallback
    │       │       └── 指数退避重试 (1s, 2s)
    │       │
    │       ├──► character.ts.applyPreset()
    │       │       └── 角色预设注入 (YYC-01 / Luna / HAL-9000)
    │       │
    │       └──► cloud.ts.sync()
    │               ├── Push (本地 → 云端)
    │               ├── Pull (云端 → 本地)
    │               └── 混合内容智能降级
    │
    └──► Component Layer
            ├── CubeVisual (3D 魔方：听=青/想=黄/说=绿)
            ├── GlobeVisual (粒子地球)
            └── VoiceVisualizer (音频波形)
```

### 语音交互流程

```
用户语音
    │
    ▼
useSpeech.startListening()
    │
    ├──► Web Speech API (SpeechRecognition)
    │       ├── 中文/英文自动识别
    │       ├── 实时转录
    │       └── 超时自动停止 (5s 静默)
    │
    └──► useAI.processMessage(transcript)
            │
            └──► useSpeech.speak(response)
                    ├── Browser TTS (SpeechSynthesis)
                    └── OpenAI TTS (fallback)
```

### 状态管理流程

```
useUIState (useReducer)
    │
    ├── State: UIState
    │   ├── panels: 10 个布尔开关
    │   ├── inspectingArtifact: { type, content }
    │   ├── debateStatus: { active, topic }
    │   ├── menuPosition: { x, y }
    │   ├── themeColor: "cyan" | "red"
    │   └── textMode: boolean
    │
    ├── Actions: UIAction
    │   ├── SET_PANEL: 面板开关
    │   ├── SET_INSPECTING_ARTIFACT: 产物查看
    │   ├── SET_DEBATE_STATUS: 辩论状态
    │   ├── SET_MENU_POSITION: 菜单位置
    │   ├── SET_THEME_COLOR: 主题色
    │   └── SET_TEXT_MODE: 文本模式
    │
    └── Dispatch: 9 个 setter 函数
        ├── setPanel(panel: PanelKey, value: boolean)
        ├── setInspectingArtifact(value)
        ├── setDebateStatus(value)
        └── ...
```

---

## 组件树

```
App.tsx
└── ResponsiveAIAssistant.tsx (主控制器)
    ├── YYC3Background.tsx
    │   └── ASCII Art + 动态流光背景
    ├── CubeVisual.tsx
    │   └── 3D 魔方 (Canvas 2D)
    ├── GlobeVisual.tsx
    │   └── 粒子地球 (Canvas 2D)
    ├── VoiceVisualizer.tsx
    │   └── 音频波形条
    ├── OrbitalMenu.tsx
    │   └── 环轨径向菜单
    ├── ConfigPanel.tsx
    │   ├── 模型配置 (提供商 + 模型 + API Key)
    │   ├── 语音配置 (TTS 引擎 + 语速)
    │   ├── 角色配置 (3 角色切换)
    │   └── 云同步配置 (Supabase)
    ├── TerminalPanel.tsx
    │   └── 文本输入终端
    ├── DebateOverlay.tsx
    │   ├── 角色 A (YYC-01)
    │   ├── 角色 B (Luna)
    │   └── 裁判 (HAL-9000)
    ├── IntelligentCenter.tsx
    │   └── 7 节点仪表盘
    ├── AIGeneratorPanel.tsx
    │   ├── Text 生成
    │   ├── Image 生成
    │   ├── Audio 生成
    │   └── Video 生成
    ├── TaskPod.tsx
    │   └── 无边界待办列表
    ├── WorkflowEditor.tsx (P1 已激活，融合原 Panel 能力)
    │   └── 真实 DAG 编辑器 (多工作流侧栏 + 拖拽节点 + SVG 连线 + DAGEngine.execute)
    ├── MCPServerPanel.tsx
    │   └── 服务器配置 (GitHub/PostgreSQL/Slack)
    ├── MultimodalArtifact.tsx
    │   └── 多模态产物查看器
    ├── NeuralNetModule.tsx (备用主题 — P2 将激活为视觉切换)
    │   └── 神经网络可视化
    ├── SecurityModule.tsx
    │   └── 安全审计界面
    └── PageSwitcher.tsx (合并了 PageSelector 的下滑手势)
        └── 页面选择器 (Ctrl+K)
```

> **变更说明 (2026-07-19)**：
> - **P0**：清理 4 个 Dead Code 组件（PageSelector / ModuleSwitcher / MCPServerManager / GeometricBackground），PageSelector 的下滑关闭手势已合并到 PageSwitcher。
> - **P1**：用 WorkflowEditor 替换 WorkflowPanel（已删除），融合真实 DAG 执行 + 多工作流侧栏 + i18n + GestureContainer。
> - **P2**：①视觉主题切换器（ConfigPanel 新增 `appearance` tab + `visualTheme` 状态 + localStorage 持久化，CubeVisual ↔ GlobeVisual 动态切换）；②React.lazy 代码分割（7 个业务面板 lazy 化 + Suspense 兜底）；③模块注册中心 `modules/registry.ts`（消除 PageSwitcher/handleSwitchPage/getCurrentPageId 三处硬编码，新增模块只需 1 处声明）。
> - **P3**：①测试用例同步完善（新增 3 个测试文件共 35 个用例：`modules/__tests__/registry.test.ts` 10 个 + `hooks/__tests__/useUIState.test.ts` 11 个 + `components/ai/__tests__/visuals.test.tsx` 14 个，总测试数 43→78）；②useUIState 导出 `initialState` + `uiReducer` 支持纯函数测试；③可访问性增强（CubeVisual + GlobeVisual 的 motion.div 增加 `role="button"` + 动态 `aria-label`，根据 AI 状态自动切换）；④build 验证 8 个独立业务 chunk 分割生效（主包 464.56 kB / gzip 152.35 kB）。

---

## 技术决策

### 为什么选择 Vite 而非 Next.js

- **开发体验**: Vite 的 HMR 比 Next.js 快 10-20 倍
- **构建速度**: ESBuild 预构建，秒级冷启动
- **部署简单**: 纯静态 SPA，无需 Node.js 服务端
- **零配置**: 无需处理 SSR/SSG/ISR 复杂度

### 为什么选择 useReducer 而非 Zustand/Redux

- **简洁性**: 项目状态有限 (10 个面板开关)，无需引入外部状态库
- **可预测性**: reducer 模式确保状态变更可追踪
- **零依赖**: 减少包体积

### 为什么选择 Tailwind CSS v4

- **oklch() 色彩空间**: 更广色域，更精确的颜色控制
- **零配置**: CSS-first 配置，无需 `tailwind.config.js`
- **性能**: 按需生成，无冗余 CSS

### 为什么选择 pnpm

- **磁盘效率**: 硬链接共享依赖，节省 50%+ 磁盘空间
- **严格依赖**: 防止幽灵依赖 (phantom dependencies)
- **速度快**: 并行安装，比 npm 快 2-3 倍

---

## 性能优化

| 策略 | 实现 | 效果 |
|:---|:---|:---|
| React.memo | VoiceVisualizer | 减少不必要重渲染 |
| Canvas 2D | CubeVisual, GlobeVisual | 绕过 React 渲染管线 |
| LRU 缓存 | RAG Embedding | 减少重复计算 |
| 请求去重 | processingRef 锁 | 防止并发请求 |
| 流式响应 | SSE ReadableStream | 降低首字延迟 |
| 指数退避 | LLM 重试 | 提高成功率 |
| 懒加载 | 图片 loading="lazy" | 减少初始加载 |
| Service Worker | 离线缓存策略 | 提升二次加载速度 |
| CSP 安全头 | Content-Security-Policy | 防止 XSS 攻击 |

---

## 安全架构

```
┌─────────────────────────────────────────────┐
│  Security Layers                             │
│  ┌───────────────────────────────────────┐   │
│  │  Layer 1: Input Validation             │   │
│  │  - XSS 过滤                             │   │
│  │  - 长度限制 (500 chars)                  │   │
│  │  - 敏感词检测                            │   │
│  └───────────────────────────────────────┘   │
│  ┌───────────────────────────────────────┐   │
│  │  Layer 2: CSP Header                   │   │
│  │  - default-src 'self'                  │   │
│  │  - script-src 'self' 'unsafe-inline'   │   │
│  │  - connect-src 'self' https: wss:      │   │
│  └───────────────────────────────────────┘   │
│  ┌───────────────────────────────────────┐   │
│  │  Layer 3: API Key Management           │   │
│  │  - localStorage 存储                   │   │
│  │  - 不暴露在代码中                        │   │
│  │  - 支持本地 Ollama (零 API Key)         │   │
│  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```