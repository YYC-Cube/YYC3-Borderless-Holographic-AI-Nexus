![YYC³ Borderless Holographic AI Nexus — Family AI](public/Family-AI-001.png)

# YYC³ Borderless Holographic AI Nexus

<div align="center">

[![Version](https://img.shields.io/badge/version-7.4.0-06b6d4?style=flat-square)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-11.10-f69220?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black?style=flat-square)](https://ui.shadcn.com/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-primitives-161618?style=flat-square&logo=radixui)](https://www.radix-ui.com/)
[![ESLint](https://img.shields.io/badge/ESLint-0_errors_0_warnings-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![License](https://img.shields.io/badge/license-Private-red?style=flat-square)](LICENSE)

</div>

---

## 项目简介

**YYC³ (YanYu Cloud Cube) Borderless Holographic AI Nexus** 是一个基于「去界面化 (Zero UI)」和「无边界 (Borderless)」设计理念构建的下一代 AI 助手。它摒弃了传统的按钮和菜单，采用**手势、语音和 3D 视觉反馈**作为核心交互手段，旨在探索未来数字生命的交互形态。

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
| 状态管理 | React Hooks + localStorage | useAI/useSpeech/useGaze |
| 测试 | Vitest | 单元测试 |
| 代码质量 | ESLint 9 + TypeScript strict | 0 错误 0 警告 |
| AI 集成 | Web Speech API + Fetch API | 多提供商 LLM |
| 数据库 | Supabase (PostgreSQL) | 可选云同步后端 |

---

## 项目架构

```
YYC³ Borderless Holographic AI Nexus/
├── App.tsx                         # 应用入口
├── index.html                      # Vite HTML 入口
├── vite.config.ts                  # Vite 构建配置
├── components/
│   ├── ResponsiveAIAssistant.tsx   # ★ 主控制器 (850+ 行)
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
│   └── useGaze.ts                 # 注视感知 (模拟眼动追踪)
├── utils/
│   ├── llm.ts                     # LLM 引擎 (多提供商/流式/重试/fallback)
│   ├── rag.ts                     # RAG 记忆 (Embedding + LRU 缓存)
│   ├── cloud.ts                   # 云同步 (Push/Pull + 混合内容检测)
│   ├── dag-engine.ts              # DAG 工作流引擎
│   ├── generation.ts              # 多模态生成 (图片/视频/音频)
│   ├── validation.ts             # 输入验证 (三层)
│   ├── character.ts               # 角色预设 (3 角色)
│   ├── model-presets.ts           # 模型预设库 (10+ 预设)
│   └── design-system.ts           # 统一设计令牌
├── types/                         # 类型定义
├── lib/supabase.ts                # Supabase 数据库客户端
├── styles/globals.css             # 全局样式 (Tailwind v4)
├── public/yyc3-icons/             # 全端图标 (favicon/PWA/iOS/Android)
└── sw.js                          # Service Worker (PWA 缓存)
```

---

## 快速开始

### 环境要求

- **Node.js** >= 18
- **pnpm** >= 9 (推荐使用 `corepack enable`)

### 安装与启动

```bash
# 安装依赖
pnpm install

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

### 代码质量

```bash
# TypeScript 类型检查
pnpm typecheck

# ESLint 检查
pnpm lint

# 运行测试
pnpm test
```

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

## 相关文档

| 文档 | 路径 |
|:---|:---|
| 操作手册 | [OPERATION_MANUAL.md](OPERATION_MANUAL.md) |
| AI Agent 指南 | [AGENTS.md](AGENTS.md) |
| 项目路线图 | [ROADMAP.md](ROADMAP.md) |
| HTTPS 配置指南 | [HTTPS_GUIDE.md](HTTPS_GUIDE.md) |
| API 设计文档 | [docs/API_DESIGN.md](docs/API_DESIGN.md) |
| 功能验收报告 | [docs/YYC3-团队通用-标准规范/YYC3-项目闭环-验收报告/](docs/YYC3-团队通用-标准规范/YYC3-项目闭环-验收报告/) |
| 团队标准规范 | [docs/YYC3-团队通用-标准规范/](docs/YYC3-团队通用-标准规范/) |

---

## 验收状态

- TypeScript 类型检查：**0 错误**
- ESLint 检查：**0 错误 0 警告**
- 核心 AI 对话：**完整实现**
- 流式响应 (SSE)：**完整实现**
- 语音交互：**完整实现（含降级方案）**
- 手势导航：**完整实现（8 方向 + 双击 + 长按）**
- 键盘快捷键：**完整实现**
- 多模态生成：**完整实现（Text/Image/Audio/Video）**
- DAG 工作流引擎：**完整实现**
- 综合评分：**90/100**

---

*YYC³ — 言启千行代码，语枢万物智能*
# YYC3-Borderless-Holographic-AI-Nexus
