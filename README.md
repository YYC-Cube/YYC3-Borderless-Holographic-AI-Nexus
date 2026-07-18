![YYC³ Borderless Holographic AI Nexus — Family AI](public/Family-AI-001.png)

# YYC³ Borderless Holographic AI Nexus

<div align="center">

[![Version](https://img.shields.io/badge/version-7.4.0-06b6d4?style=flat-square)](package.json)
[![GitHub Repo](https://img.shields.io/badge/GitHub-YYC3_Borderless_Holographic_AI_Nexus-181717?style=flat-square&logo=github)](https://github.com/YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-11.10-f69220?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black?style=flat-square)](https://ui.shadcn.com/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-primitives-161618?style=flat-square&logo=radixui)](https://www.radix-ui.com/)
[![ESLint](https://img.shields.io/badge/ESLint-0_errors_0_warnings-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![Deploy](https://img.shields.io/badge/Deploy-zero.yyc3.top-06b6d4?style=flat-square)](https://zero.yyc3.top)
[![CI/CD](https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions)](.github/workflows/deploy.yml)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 项目简介

**YYC³ (YanYu Cloud Cube) Borderless Holographic AI Nexus** 是一个基于「去界面化 (Zero UI)」和「无边界 (Borderless)」设计理念构建的下一代 AI 助手。它摒弃了传统的按钮和菜单，采用**手势、语音和 3D 视觉反馈**作为核心交互手段，旨在探索未来数字生命的交互形态。

> **仓库地址**: [https://github.com/YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus](https://github.com/YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus)
> **部署地址**: [https://zero.yyc3.top](https://zero.yyc3.top)
> **综合评分**: 90/100 — 五高架构 | 五标准体系 | 五维度驱动

### 核心特性

- **全息视觉核心**：3D 动态魔方 (`CubeVisual`)，根据 AI 状态（聆听、思考、说话）实时反馈
- **Zero UI 交互**：8 方向手势导航 + 长按语音 + 双击环轨菜单 + 键盘快捷键
- **多模型 AI 引擎**：支持 Ollama / OpenAI / DeepSeek / Moonshot / Zhipu / Yi / Anthropic 共 8 个提供商
- **流式响应**：SSE 流式响应 + 非流式 fallback + 指数退避自动重试
- **多模态生成**：Text / Image / Audio / Video 四模式生成器
- **语音交互**：Web Speech API 语音识别 + Browser/OpenAI TTS 双引擎 + 音频可视化
- **RAG 记忆系统**：多提供商 Embedding + 余弦相似度检索 + LRU 缓存
- **DAG 工作流引擎**：拓扑排序 + 循环检测 + 可视化编辑器
- **角色系统**：YYC-01 / Luna / HAL-9000 三角色 + AI 辩论矩阵
- **云同步**：Push/Pull 双向同步 + 混合内容智能降级
- **沉浸式体验**：动态背景流光、玻璃拟态 UI、CRT 扫描线、ASCII 艺术背景

---

## 架构可视化

```
┌─────────────────────────────────────────────────────────────────┐
│                        YYC³ 系统架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Gesture     │  │  Voice       │  │  Keyboard            │   │
│  │  Input       │  │  Input       │  │  Input               │   │
│  │  (8-dir)     │  │  (Web API)   │  │  (Shortcuts)         │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           │                                      │
│                    ┌──────▼──────┐                               │
│                    │  useUIState │  ◄── 统一状态管理              │
│                    │  (Reducer)  │                               │
│                    └──────┬──────┘                               │
│                           │                                      │
│         ┌─────────────────┼─────────────────┐                    │
│         │                 │                 │                    │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐             │
│  │  useAI      │  │  useSpeech  │  │  useGaze    │             │
│  │  (LLM/Mem)  │  │  (STT/TTS)  │  │  (EyeTrack) │             │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘             │
│         │                 │                                      │
│  ┌──────▼─────────────────▼──────┐                               │
│  │        AI Engine Layer        │                               │
│  │  ┌──────┐ ┌──────┐ ┌───────┐ │                               │
│  │  │ LLM  │ │ RAG  │ │ Cloud │ │                               │
│  │  │(8 PV)│ │(LRU) │ │(Sync) │ │                               │
│  │  └──────┘ └──────┘ └───────┘ │                               │
│  │  ┌──────┐ ┌──────┐ ┌───────┐ │                               │
│  │  │ DAG  │ │ Gen  │ │ Char  │ │                               │
│  │  │Engine│ │(4-M) │ │(3-C)  │ │                               │
│  │  └──────┘ └──────┘ └───────┘ │                               │
│  └───────────────────────────────┘                               │
│                           │                                      │
│  ┌────────────────────────▼────────────────────────┐             │
│  │              Component Layer                      │             │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │             │
│  │  │ Cube     │ │ Globe    │ │ Voice            │ │             │
│  │  │ Visual   │ │ Visual   │ │ Visualizer       │ │             │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │             │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │             │
│  │  │ Config   │ │ Terminal │ │ Debate           │ │             │
│  │  │ Panel    │ │ Panel    │ │ Overlay          │ │             │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │             │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │             │
│  │  │ Orbital  │ │ AI Gen   │ │ Intelligent      │ │             │
│  │  │ Menu     │ │ Panel    │ │ Center           │ │             │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │             │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │             │
│  │  │ TaskPod  │ │ Workflow │ │ MCP Server       │ │             │
│  │  │          │ │ Editor   │ │ Manager          │ │             │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │             │
│  └─────────────────────────────────────────────────┘             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              UI Foundation (shadcn/ui + Radix)               │ │
│  │  48 组件 · 无障碍 · WAI-ARIA · 键盘导航 · 深色模式            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户输入 (手势/语音/键盘)
    │
    ▼
ResponsiveAIAssistant (主控制器)
    │
    ├──► useAI.processMessage()
    │       │
    │       ├──► llm.ts (多提供商 → 流式/非流式)
    │       ├──► rag.ts (Embedding → 语义检索)
    │       └──► cloud.ts (Push/Pull 同步)
    │
    ├──► useSpeech (Web Speech API / TTS)
    │
    └──► Component Layer (CubeVisual / GlobeVisual / VoiceVisualizer)
            │
            ▼
        视觉反馈 (3D 动画 / 粒子 / 波形)
```

---

## 技术栈

| 类别 | 技术 | 说明 |
|:---|:---|:---|
| 框架 | React 18 + TypeScript 5.6 | 严格模式，0 类型错误 |
| 构建 | Vite 5.4 | 极速 HMR + ESBuild |
| 包管理 | pnpm 11.10 | workspace + 严格依赖 |
| 样式 | Tailwind CSS v4 | oklch() 色彩空间 |
| 动画 | Motion (Framer Motion) | 弹簧物理动画 |
| 图标 | Lucide React | 一致的图标系统 |
| UI 组件 | shadcn/ui + Radix UI | 48 个 UI 组件 |
| 状态管理 | React Hooks + useReducer | useAI/useSpeech/useGaze |
| 单元测试 | Vitest | 快如闪电的测试运行器 |
| E2E 测试 | Playwright | 多浏览器端到端测试 |
| 代码质量 | ESLint 9 + TypeScript strict | 0 错误 0 警告 |
| AI 集成 | Web Speech API + Fetch API | 多提供商 LLM |
| 数据库 | Supabase (PostgreSQL) | 可选云同步后端 |
| 国际化 | i18n | 10 语言支持 |
| CI/CD | GitHub Actions | 自动化构建/测试/部署 |
| PWA | Service Worker | 离线缓存 + 安装到桌面 |

---

## 项目结构

```
YYC³ Borderless Holographic AI Nexus/
├── App.tsx                         # 应用入口
├── index.html                      # Vite HTML 入口
├── vite.config.ts                  # Vite 构建配置
├── tsconfig.json                   # TypeScript 配置
├── sw.js                           # Service Worker (PWA 缓存)
├── .env.example                    # 环境变量模板
├── components/
│   ├── ResponsiveAIAssistant.tsx   # ★ 主控制器 (~650 行)
│   ├── YYC3Background.tsx          # ASCII 艺术背景
│   ├── ai/                        # 核心 AI 功能 (16 个组件)
│   │   ├── ConfigPanel.tsx         #   模型/语音/角色/云同步配置
│   │   ├── TerminalPanel.tsx       #   文本输入终端
│   │   ├── DebateOverlay.tsx       #   多角色辩论矩阵
│   │   ├── OrbitalMenu.tsx         #   环轨手势菜单
│   │   ├── IntelligentCenter.tsx   #   全息智能中心
│   │   ├── CubeVisual.tsx          #   3D 魔方可视化
│   │   ├── GlobeVisual.tsx         #   地球粒子可视化
│   │   ├── VoiceVisualizer.tsx     #   语音波形可视化
│   │   ├── MultimodalArtifact.tsx  #   多模态产物查看器
│   │   ├── AIGeneratorPanel.tsx    #   AI 生成器 (Text/Image/Audio/Video)
│   │   ├── NeuralNetModule.tsx     #   神经网络模块
│   │   ├── SecurityModule.tsx      #   安全审计模块
│   │   └── PageSelector.tsx        #   页面选择器
│   ├── modules/                   # 业务模块 (6 个)
│   │   ├── TaskPod.tsx             #   任务舱 (无边界待办)
│   │   ├── WorkflowEditor.tsx      #   DAG 工作流编辑器
│   │   ├── WorkflowPanel.tsx       #   工作流面板
│   │   ├── MCPServerManager.tsx    #   MCP 服务器管理
│   │   ├── MCPServerPanel.tsx      #   MCP 服务器面板
│   │   └── ModuleSwitcher.tsx      #   模块切换器
│   └── ui/                        # shadcn/ui 组件库 (48 个)
├── hooks/
│   ├── useAI.ts                   # ★ AI 核心逻辑 (消息/记忆/云同步/指令)
│   ├── useSpeech.ts               # 语音识别 + TTS + 音频可视化
│   ├── useUIState.ts              # 统一面板状态管理 (useReducer)
│   ├── useGaze.ts                 # 注视感知 (模拟眼动追踪)
│   ├── useKeyboardShortcuts.ts    # 键盘快捷键逻辑
│   └── useGestureHandler.tsx      # 手势处理逻辑
├── utils/
│   ├── llm.ts                     # LLM 引擎 (多提供商/流式/重试/fallback)
│   ├── rag.ts                     # RAG 记忆 (Embedding + LRU 缓存)
│   ├── cloud.ts                   # 云同步 (Push/Pull + 混合内容检测)
│   ├── dag-engine.ts              # DAG 工作流引擎
│   ├── generation.ts              # 多模态生成 (图片/视频/音频)
│   ├── validation.ts              # 输入验证 (三层)
│   ├── character.ts               # 角色预设 (3 角色)
│   ├── model-presets.ts           # 模型预设库 (10+ 预设)
│   └── design-system.ts           # 统一设计令牌
├── types/                         # 类型定义
├── lib/supabase.ts                # Supabase 数据库客户端
├── src/i18n/                      # 国际化 (10 语言)
├── tests/                         # E2E 测试 (Playwright)
├── styles/globals.css             # 全局样式 (Tailwind v4)
├── public/yyc3-icons/             # 全端图标 (favicon/PWA/iOS/Android)
└── .github/workflows/             # CI/CD 自动化部署
```

---

## 快速开始

### 环境要求

- **Node.js** >= 18
- **pnpm** >= 9 (推荐使用 `corepack enable`)

### 安装与启动

```bash
# 克隆仓库
git clone git@github.com:YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus.git
cd YYC3-Borderless-Holographic-AI-Nexus

# 安装依赖
pnpm install

# 配置环境变量 (可选)
cp .env.example .env

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

### 配置本地大模型 (Ollama)

```bash
# 1. 安装 Ollama
brew install ollama       # macOS
# 或访问 https://ollama.com 下载

# 2. 拉取模型
ollama pull llama3

# 3. 启动 Ollama (必须配置 CORS)
OLLAMA_ORIGINS="*" ollama serve
```

---

## 开发指南

### 代码质量

```bash
# TypeScript 类型检查
pnpm typecheck

# ESLint 检查
pnpm lint

# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm test:e2e

# E2E 测试 (可视化模式)
pnpm test:e2e:ui
```

### 测试

| 测试类型 | 命令 | 框架 | 说明 |
|:---|:---|:---|:---|
| 类型检查 | `pnpm typecheck` | TypeScript | 0 类型错误 |
| 代码规范 | `pnpm lint` | ESLint 9 | 0 错误 0 警告 |
| 单元测试 | `pnpm test` | Vitest | 组件 + Hook 测试 |
| E2E 测试 | `pnpm test:e2e` | Playwright | 10 测试用例，多浏览器 |

### 项目脚本

| 脚本 | 说明 |
|:---|:---|
| `pnpm dev` | 启动开发服务器 (HMR) |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm preview` | 预览生产构建 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` | ESLint 代码规范检查 |
| `pnpm test` | 运行 Vitest 单元测试 |
| `pnpm test:watch` | 监听模式单元测试 |
| `pnpm test:e2e` | 运行 Playwright E2E 测试 |
| `pnpm test:e2e:ui` | Playwright 可视化测试 |

---

## 操作指南

### 手势导航 (8 方向)

| 手势 | 功能 |
|:---|:---|
| 长按 (600ms) | 语音输入 |
| 双击 / 双指 | 环轨菜单 |
| 上划 | 文本输入终端 |
| 下划 | 历史记录 |
| 左划 | 智能中心 |
| 右划 | 设置面板 |
| 右下划 | 任务舱 |
| 左下划 | 辩论矩阵 |
| 右上划 | 重置会话 |
| 左上划 | 主题切换 |

### 键盘快捷键

| 快捷键 | 功能 |
|:---|:---|
| `ESC` | 关闭当前面板 |
| `Ctrl+K` | 搜索命令 |
| `Ctrl+,` | 打开设置 |
| `Ctrl+H` | 历史记录 |
| `Ctrl+Shift+T` | 切换主题 |

### 任务手势

| 手势 | 功能 |
|:---|:---|
| 任务左滑 | 删除任务 |
| 任务右滑 | 完成任务 |
| 面板下滑 | 关闭面板 |

---

## AI 功能

### 支持的 LLM 提供商

| 提供商 | 端点类型 | 说明 |
|:---|:---|:---|
| Ollama | `/api/chat` | 本地部署，隐私优先 |
| OpenAI | `/v1/chat/completions` | GPT-4o / GPT-4o-mini |
| DeepSeek | `/v1/chat/completions` | DeepSeek-V3 / Coder |
| Moonshot | `/v1/chat/completions` | 月之暗面 |
| Zhipu | `/v1/chat/completions` | GLM-4 系列 |
| Yi | `/v1/chat/completions` | 零一万物 |
| Anthropic | `/v1/chat/completions` | Claude 3.5 Sonnet |
| Custom | 自定义 | 任意 OpenAI 兼容端点 |

### AI 指令系统

AI 可通过 `[[CMD:指令]]` 令牌控制界面：

- `[[CMD:OPEN_SETTINGS]]` — 打开设置面板
- `[[CMD:OPEN_HISTORY]]` — 打开历史记录
- `[[CMD:THEME_RED]]` / `[[CMD:THEME_CYAN]]` — 切换主题

---

## CI/CD 自动化部署

本项目通过 GitHub Actions 实现自动化 CI/CD，推送到 `main` 分支后自动执行：

| 阶段 | 命令 | 说明 |
|:---|:---|:---|
| Setup | — | pnpm + Node.js 环境准备 |
| Type Check | `pnpm typecheck` | TypeScript 类型检查 |
| Lint | `pnpm lint` | ESLint 代码规范检查 |
| Test | `pnpm test` | Vitest 单元测试 |
| Build | `pnpm build` | Vite 生产构建 |
| Deploy | GitHub Pages | 自动部署到 `zero.yyc3.top` |

> 工作流配置: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

---

## 验收状态

| 验收项 | 状态 | 说明 |
|:---|:---|:---|
| TypeScript 类型检查 | 0 错误 | strict mode |
| ESLint 检查 | 0 错误 0 警告 | `--max-warnings=0` |
| 核心 AI 对话 | 完整实现 | 多提供商 + 流式响应 |
| 流式响应 (SSE) | 完整实现 | 自动 fallback |
| 语音交互 | 完整实现 | 含降级方案 |
| 手势导航 | 完整实现 | 8 方向 + 双击 + 长按 |
| 键盘快捷键 | 完整实现 | 5 组快捷键 |
| 多模态生成 | 完整实现 | Text/Image/Audio/Video |
| DAG 工作流引擎 | 完整实现 | 拓扑排序 + 循环检测 |
| 国际化 | 完整实现 | 10 语言 |
| E2E 测试 | 完整实现 | Playwright 10 tests |
| CI/CD | 完整实现 | GitHub Actions |
| 综合评分 | **90/100** | 五高架构 |

---

## 相关文档

| 文档 | 路径 | 说明 |
|:---|:---|:---|
| 架构设计 | [ARCHITECTURE.md](ARCHITECTURE.md) | 系统架构可视化与数据流 |
| 贡献指南 | [CONTRIBUTING.md](CONTRIBUTING.md) | 开发规范与贡献流程 |
| 变更日志 | [CHANGELOG.md](CHANGELOG.md) | 版本变更记录 |
| 项目路线图 | [ROADMAP.md](ROADMAP.md) | 开发计划与里程碑 |
| 操作手册 | [OPERATION_MANUAL.md](OPERATION_MANUAL.md) | 用户操作指南 |
| AI Agent 指南 | [AGENTS.md](AGENTS.md) | AI Agent 配置说明 |
| HTTPS 配置 | [HTTPS_GUIDE.md](HTTPS_GUIDE.md) | HTTPS 部署指南 |
| API 设计文档 | [docs/API_DESIGN.md](docs/API_DESIGN.md) | API 接口设计 |
| 验收报告 | [docs/YYC3-团队通用-标准规范/YYC3-项目闭环-验收报告/](docs/YYC3-团队通用-标准规范/YYC3-项目闭环-验收报告/) | 功能完整性验收 |
| 标准规范 | [docs/YYC3-团队通用-标准规范/](docs/YYC3-团队通用-标准规范/) | 团队开发标准 |
| 属性说明 | [Attributions.md](Attributions.md) | 第三方依赖与属性 |

---

## 贡献

欢迎贡献！请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解开发规范和提交流程。

### 贡献者

本项目由 [YYC-Cube](https://github.com/YYC-Cube) 团队开发和维护。

---

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

## GitHub Topics

`ai-assistant` `zero-ui` `holographic` `3d-visualization` `gesture-control` `voice-interaction` `next-gen-ui` `react` `typescript` `vite` `tailwindcss` `shadcn-ui` `radix-ui` `llm` `multimodal` `dag-workflow` `rag` `pwa` `supabase` `pnpm`

---

*YYC³ — 言启千行代码，语枢万物智能*
