# Changelog

All notable changes to YYC³ Borderless Holographic AI Nexus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [7.4.0] - 2026-07-18

### Added
- 开源级开发者文档体系：CONTRIBUTING.md、CHANGELOG.md、ARCHITECTURE.md
- `.env.example` 环境变量模板
- MIT License 开源许可证
- CSP 安全头 (`Content-Security-Policy` meta 标签)
- 架构可视化 ASCII 图 (数据流 + 组件层次)

### Changed
- 组件拆分解耦：提取 `useKeyboardShortcuts` 和 `useGestureHandler` 自定义 Hooks
- `VoiceVisualizer` 添加 `React.memo` 性能优化
- `ResponsiveAIAssistant.tsx` 从 828 行精简至 ~650 行
- Service Worker 缓存版本升级至 v3，增强预缓存策略
- 全局 Tailwind CSS v4 迁移：`bg-gradient-to-*` → `bg-linear-to-*`，`h-[1px]` → `h-px`
- README.md 完善：新增架构图、测试指南、贡献指南、CI/CD 文档

### Fixed
- Artifact 检查器图片添加 `loading="lazy"` 懒加载
- 修复 `useKeyboardShortcuts` 和 `useGestureHandler` 的 TypeScript 类型兼容性

### Infrastructure
- 迁移至 Vite + pnpm 独立构建系统
- README 完整重写，新增徽章系统和架构可视化
- 全端图标配置 (`yyc3-icons/`)
- GitHub Actions CI/CD 自动化部署到 `zero.yyc3.top`

### Quality
- TypeScript 0 错误，strict mode
- ESLint 0 错误 0 警告
- 流式响应、LLM 重试、Embedding 缓存、消息上限、请求去重、键盘快捷键全部完成

---

## [7.3.0] - 2026-02-04

### Added
- 智能中心 (Intelligent Center): 全息仪表盘视图 (7 节点)
- 任务舱 (Task Pod): 无边界待办模块，语音添加 + 手势管理
- 注视感知 (useGaze): 指针驻留触发交互
- MCP Server Manager: GitHub/PostgreSQL/Slack 三协议
- Workflow Panel + Editor: 4 条预设工作流 + 可视化编辑器
- 神经网络模块 (NeuralNetModule): 神经网络可视化
- 安全模块 (SecurityModule): 安全审计界面

### Changed
- 统一设计令牌 (`utils/design-system.ts`)

---

## [7.2.0] - Phase 8

### Added
- AI Generator Panel: Text/Image/Audio/Video 四模式生成器
- Video/Audio Generation: 后端 API 已接入
- DAG 引擎集成: 拓扑排序 + 循环检测 + 编辑器集成
- 流式响应 (SSE): 自动非流式 fallback
- LLM 请求重试: 指数退避 (1s/2s)
- Embedding 缓存: LRU 缓存 (100 条)
- 消息上限: MAX_MESSAGES = 500
- 请求去重: processingRef 锁
- 键盘快捷键: ESC / Ctrl+K / Ctrl+, / Ctrl+H / Ctrl+Shift+T

---

## [7.1.0] - Phase 9

### Added
- TypeScript strict mode, 0 类型错误
- ESLint 0 错误 0 警告
- 文档体系：README 完整重写，徽章系统，架构可视化
- E2E 测试：Playwright 10 tests, 多浏览器
- i18n 国际化：10 语言支持
- 验收报告：综合评分 90/100

---

## [7.0.0] - Phase 6

### Added
- Zero UI 重构
- 环轨菜单 (Orbital Menu)
- 全屏手势导航 (8 方向)
- 沉浸式设置面板

---

## [6.0.0] - Phase 5

### Added
- RAG 记忆系统 (多提供商 Embedding + 余弦相似度)
- 云同步 (Push/Pull 双向 + 混合内容降级)
- 角色系统 (YYC-01 / Luna / HAL-9000)

---

## [5.0.0] - Phase 4

### Added
- 语音交互 (Web Speech API + TTS)
- 3D 魔方可视化 (CubeVisual)
- 地球粒子可视化 (GlobeVisual)

---

## [4.0.0] - Phase 3

### Added
- 多模型 AI 引擎 (Ollama / OpenAI / DeepSeek / Moonshot / Zhipu / Yi / Anthropic)
- 流式响应基础架构

---

## [3.0.0] - Phase 2

### Added
- 手势识别系统 (8 方向)
- 长按语音输入
- 双击环轨菜单

---

## [2.0.0] - Phase 1

### Added
- 项目初始化
- 基础架构搭建
- React + TypeScript + Vite 技术栈

---

## [1.0.0] - Pre-Alpha

### Added
- 概念验证 (PoC)
- 基础 3D 可视化
- 初始 UI 设计

---

[7.4.0]: https://github.com/YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus/releases/tag/v7.4.0
[7.3.0]: https://github.com/YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus/releases/tag/v7.3.0
[7.2.0]: https://github.com/YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus/releases/tag/v7.2.0
[7.1.0]: https://github.com/YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus/releases/tag/v7.1.0
[7.0.0]: https://github.com/YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus/releases/tag/v7.0.0