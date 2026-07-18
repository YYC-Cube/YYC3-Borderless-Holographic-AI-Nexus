# YYC³ Project Roadmap

## Vision

构建一个去界面化 (Zero UI)、高沉浸感、具备物理交互特性的数字生命体。

## Phased Plan

### Phase 1-6: 已完成

- 架构、视觉、记忆、TTS、云同步、Zero UI 重构、手势导航、环轨菜单全部就绪。

### Phase 7: 智能中心与模块化 — 已完成

- [x] **Design System**: 建立了 `utils/design-system.ts` 统一视觉规范。
- [x] **Intelligent Center**: 完成了全息仪表盘视图 (7 节点)。
- [x] **Task Pod**: 无边界待办模块，语音添加 + 手势管理。
- [x] **Global Gaze**: `useGaze` hook，指针驻留触发交互。
- [x] **MCP Server Manager**: GitHub/PostgreSQL/Slack 三协议。
- [x] **Workflow Panel + Editor**: 4 条预设工作流 + 可视化编辑器。
- [x] **Neural Network Module**: 神经网络可视化。
- [x] **Security Module**: 安全审计界面。

### Phase 8: 多模态与全链路闭环 — 已完成

- [x] **AI Generator Panel**: Text/Image/Audio/Video 四模式生成器。
- [x] **Video/Audio Generation**: 后端 API 已接入。
- [x] **DAG Engine Integration**: 拓扑排序 + 循环检测 + 编辑器集成。
- [x] **Streaming Response**: SSE 流式响应 + 非流式 fallback。
- [x] **LLM Request Retry**: 指数退避自动重试 (1s/2s)。
- [x] **Embedding Cache**: LRU 缓存 (100 条)。
- [x] **Message Limit**: MAX_MESSAGES = 500。
- [x] **Request Deduplication**: processingRef 锁。
- [x] **Keyboard Shortcuts**: ESC/Ctrl+K/Ctrl+,/Ctrl+H/Ctrl+Shift+T。

### Phase 9: 质量与标准化 — 已完成

- [x] **TypeScript**: 0 类型错误，strict mode。
- [x] **ESLint**: 0 错误 0 警告。
- [x] **Vite Migration**: 从 Figma Make 导出 → 独立 Vite + pnpm 项目。
- [x] **Documentation**: README 完整重写，徽章系统，架构可视化。
- [x] **Logo System**: 全端图标配置 (favicon/PWA/iOS/Android)。
- [x] **Acceptance Report**: 综合评分 90/100。

### Phase 10: 持续优化 (已完成)

- [x] **Supabase Integration**: 完成数据库环境变量配置或移除。
- [x] **Image Lazy Loading**: 历史消息图片懒加载。
- [x] **React.memo**: 对 CubeVisual、GlobeVisual 等重渲染组件优化。
- [x] **State Management**: 考虑 `useReducer` 统一面板状态。
- [x] **Service Worker**: 增强离线缓存策略。
- [x] **i18n**: 国际化支持 (10 语言)。
- [x] **E2E Tests**: Playwright 端到端测试 (10 tests, 多浏览器)。
- [x] **CI/CD**: GitHub Actions 自动化部署到 zero.yyc3.top。
- [x] **Documentation**: 远程仓库地址添加，Topics 标签配置。
- [x] **CSP Security**: Content-Security-Policy 安全头。
- [x] **Tailwind v4**: bg-gradient-to-*→ bg-linear-to-* 迁移。
- [x] **Component Split**: ResponsiveAIAssistant 拆分解耦 (useKeyboardShortcuts + useGestureHandler)。
- [x] **Open Source**: 开源级文档体系 (CONTRIBUTING.md / CHANGELOG.md / ARCHITECTURE.md / LICENSE)。

---

## Change Log

### v7.4.0 (2026-07-18)

- **Infrastructure**: 迁移至 Vite + pnpm 独立构建系统。
- **Docs**: README 完整重写，新增徽章系统和架构可视化。
- **Logo**: 全端图标配置 (`yyc3-icons/`)。
- **Quality**: TypeScript 0 错误，ESLint 0 错误 0 警告。
- **Features**: 流式响应、LLM 重试、Embedding 缓存、消息上限、请求去重、键盘快捷键全部完成。
- **Optimization**: 组件拆分解耦 (useKeyboardShortcuts + useGestureHandler)，React.memo 优化，图片懒加载，Service Worker v3。
- **Security**: CSP 安全头 (`Content-Security-Policy`)。
- **Migration**: Tailwind CSS v4 (`bg-gradient-to-*` → `bg-linear-to-*`)。
- **Open Source**: 开源级文档体系 (CONTRIBUTING.md / CHANGELOG.md / ARCHITECTURE.md / LICENSE / .env.example)。

### v7.3.0 (2026-02-04)

- 智能中心、任务舱、注视感知、MCP 管理、工作流编辑器、神经网络模块、安全模块。

### v7.0.0 (Phase 6)

- Zero UI 重构、环轨菜单、全屏手势导航、沉浸式设置面板。
