# AGENTS.md

AI Agent 开发指南 for **YYC³ AI Assistant (言语云魔方 / YanYu Cloud Cube)**.

> 基于 Vite + React 18 + TypeScript 的全息 AI 助手项目，交互以手势、语音和 3D 视觉反馈为核心。

---

## 1. 项目类型

- 独立的 **Vite + React** 项目，使用 **pnpm** 作为包管理器。
- 构建/开发/测试命令均通过 `pnpm` 执行，详见 `package.json` scripts。
- 入口文件：`index.html` → `App.tsx`。

---

## 2. 常用命令

| 任务 | 命令 | 说明 |
|:---|:---|:---|
| 启动开发服务器 | `pnpm dev` | Vite HMR，默认端口 5173 |
| 生产构建 | `pnpm build` | tsc 类型检查 + vite build |
| 预览构建 | `pnpm preview` | 预览生产构建产物 |
| 类型检查 | `pnpm typecheck` | `tsc --noEmit` |
| ESLint | `pnpm lint` | 0 错误 0 警告 |
| 运行测试 | `pnpm test` | vitest run |
| 测试监听 | `pnpm test:watch` | vitest watch 模式 |
| 安装依赖 | `pnpm install` | 使用 pnpm 安装 |

---

## 3. 技术栈

- **React 18 + TypeScript 5.6** (strict mode)
- **Vite 5.4** (构建工具)
- **pnpm 11.10** (包管理器，已在 package.json 中声明 `packageManager`)
- **Tailwind CSS v4** — `styles/globals.css` 使用 v4 语法：`@custom-variant dark`, `@theme inline { ... }`, `oklch()` 颜色
- **Motion (Framer Motion)** — 从 `motion/react` 导入，**不是** `framer-motion`
- **Lucide React** — 图标库
- **Radix UI + shadcn/ui** — `components/ui/` 下的 48 个 UI 组件
- **Vitest** — 单元测试
- **Supabase** — 可选云同步后端 (`lib/supabase.ts`)
- **Web Speech API** — 语音识别/合成

---

## 4. 路径别名

`@/` 指向项目根目录：

```ts
import { Button } from '@/components/ui/button';
import { LLMConfig } from '@/types';
import { useAI } from '@/hooks/useAI';
```

**不要**使用相对路径 `../../` 当 `@/` 别名已存在时。

---

## 5. 代码组织

```
App.tsx                         # 入口 — 渲染 <ResponsiveAIAssistant/> + <Toaster/>
index.html                      # Vite HTML 入口
vite.config.ts                  # Vite 构建配置
manifest.json                   # PWA manifest
components/
  ResponsiveAIAssistant.tsx     # 主控制器 (~850 行): 手势编排、面板状态、键盘快捷键
  YYC3Background.tsx            # ASCII 艺术背景
  ai/                           # AI 核心面板 (16 个组件)
  modules/                      # 业务模块 (6 个)
  ui/                           # shadcn/ui 组件库 (48 个)
hooks/
  useAI.ts                      # AI 核心逻辑 (消息/记忆/云同步/指令解析)
  useSpeech.ts                  # 语音识别 + TTS (Browser & OpenAI) + 音频可视化
  useGaze.ts                    # 注视感知 (指针驻留检测)
lib/supabase.ts                 # 类型化 Supabase 客户端
types/
  index.ts                      # LLMConfig, MessageContent, ServerNode, WorkflowDef 等
  database.ts                   # Supabase Database 类型
  speech.d.ts                   # 全局 SpeechRecognition 类型
utils/
  llm.ts                        # LLM 引擎 (多提供商/流式/重试/fallback)
  validation.ts                 # 输入验证 (配置/消息/生成请求)
  rag.ts                        # RAG 记忆 (Embedding + LRU 缓存)
  cloud.ts                      # 云同步 (Push/Pull + 混合内容检测)
  dag-engine.ts                 # DAG 工作流引擎
  generation.ts                 # 多模态生成 (图片/视频/音频)
  model-presets.ts              # 模型预设库
  character.ts                  # 角色预设 (YYC-01, Luna, HAL-9000)
  design-system.ts              # 统一设计令牌
public/yyc3-icons/              # 全端图标 (favicon/PWA/iOS/Android)
styles/globals.css              # Tailwind v4 主题令牌
sw.js                           # Service Worker
```

---

## 6. 编码规范

### 组件
- **命名导出**：所有组件使用 `export function Foo()`，除 `App` 外不使用 default export。
- 文件命名：组件 `PascalCase.tsx`，Hook `camelCase.ts`。
- shadcn/ui 组件遵循标准布局：`data-slot` 属性、`cva` variants、`cn()` 工具函数。
- 合并 Tailwind 类名时使用 `cn()` from `@/components/ui/utils`。

### 设计令牌
- 共享视觉常量在 `utils/design-system.ts` 的 `YYC3_DESIGN` 对象中。
- 双主题：`cyan`（默认/逻辑）和 `red`（战术/警报）。

### 动画
- 始终从 `motion/react` 导入：
  ```ts
  import { motion, AnimatePresence, PanInfo } from 'motion/react';
  ```
- 条件渲染面板使用 `AnimatePresence`。

### 手势
- 可复用手势包装器：`GestureContainer` — 水平滑动关闭和上滑切换器。
- 顶层手势在 `ResponsiveAIAssistant.tsx` 中编排。

### 持久化
- 所有 localStorage key 使用 `yyc_` 前缀：`yyc_config`, `yyc_history`, `yyc_memories`, `yyc_uid`。

### 注释语言
- 代码注释和系统提示使用**中文**。用户界面字符串默认为中文。

---

## 7. AI / LLM 子系统

### 提供商模型
- `LLMConfig` (in `types/index.ts`) 是核心配置对象。
- 支持 8 个提供商：`ollama | openai | deepseek | moonshot | zhipu | yi | anthropic | custom`。
- `utils/model-presets.ts` 包含 `DEFAULT_PRESETS` 列表。
- `utils/character.ts` 包含 `PRESET_CHARACTERS` (YYC-01, Luna, HAL-9000)。

### 指令系统
- AI 通过 `[[CMD:指令]]` 令牌控制界面，前端解析并执行指令。

### 流式响应
- `generateCompletionStream` 支持 SSE 流式响应，含非流式 fallback。
- `fetchWithRetry` 提供指数退避自动重试 (1s/2s)。

---

## 8. 测试

- 测试文件位于 `utils/__tests__/` 目录。
- 使用 Vitest 运行：`pnpm test`。
- 测试覆盖：LLM、RAG、DAG 引擎、验证逻辑。