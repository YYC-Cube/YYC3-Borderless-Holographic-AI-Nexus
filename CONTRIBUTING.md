# Contributing to YYC³

感谢你对 YYC³ Borderless Holographic AI Nexus 的关注！本文档将指导你如何参与项目贡献。

---

## 行为准则

请保持专业、尊重和建设性的交流方式。我们致力于为所有参与者提供友好、包容的贡献环境。

---

## 开发环境

### 环境要求

- **Node.js** >= 18
- **pnpm** >= 9 (推荐 `corepack enable`)
- **Git** >= 2.30

### 初始化

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
```

---

## 开发规范

### 分支策略

```
main       ← 生产分支 (自动部署)
├── dev    ← 开发分支
├── feat/* ← 功能分支 (feat/xxx)
├── fix/*  ← 修复分支 (fix/xxx)
└── docs/* ← 文档分支 (docs/xxx)
```

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**类型 (type)**:

| 类型 | 说明 |
|:---|:---|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式 (不影响功能) |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具/依赖 |
| `ci` | CI/CD 配置 |

**示例**:

```
feat(ai): add streaming response support for DeepSeek

fix(gesture): correct swipe direction detection on mobile

docs(readme): add architecture diagram and contributing guide
```

### 代码风格

- **TypeScript**: 严格模式 (`strict: true`)，为所有函数和组件编写类型
- **React**: 使用函数组件 + Hooks，优先使用 `React.memo` 和 `useMemo` 优化性能
- **CSS**: 使用 Tailwind CSS v4，`bg-linear-to-*` 替代 `bg-gradient-to-*`
- **命名**: 组件用 PascalCase，文件用 camelCase 或 PascalCase，Hooks 用 `use` 前缀
- **导入顺序**: 外部库 → 内部模块 → 类型 → 样式

### 质量门禁

提交前必须通过以下检查：

```bash
pnpm typecheck    # TypeScript 类型检查 (0 errors)
pnpm lint         # ESLint 代码规范 (0 errors, 0 warnings)
pnpm test         # Vitest 单元测试
pnpm test:e2e     # Playwright E2E 测试
pnpm build        # 生产构建
```

---

## 贡献流程

### 1. 创建 Issue

在开始工作之前，先创建一个 Issue 描述你的想法或问题。这样可以：
- 避免重复工作
- 让维护者有机会提供反馈
- 确保你的方案符合项目方向

### 2. 创建分支

```bash
git checkout -b feat/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 3. 开发与测试

```bash
# 开发模式
pnpm dev

# 运行测试
pnpm test
pnpm test:e2e

# 质量检查
pnpm typecheck && pnpm lint
```

### 4. 提交与推送

```bash
git add .
git commit -m "feat(scope): describe your change"
git push origin feat/your-feature-name
```

### 5. 创建 Pull Request

- 填写 PR 描述，链接相关 Issue
- 确保所有 CI 检查通过
- 等待 Code Review

---

## 项目架构

详细架构说明请参考 [ARCHITECTURE.md](ARCHITECTURE.md)。

### 核心组件

| 组件 | 文件 | 说明 |
|:---|:---|:---|
| 主控制器 | `ResponsiveAIAssistant.tsx` | 应用主入口，协调所有交互 |
| AI 引擎 | `hooks/useAI.ts` | 多提供商 LLM + 记忆 + 云同步 |
| 语音引擎 | `hooks/useSpeech.ts` | STT + TTS + 音频可视化 |
| UI 状态 | `hooks/useUIState.ts` | 统一面板状态 useReducer |
| LLM 核心 | `utils/llm.ts` | 多提供商/流式/重试/fallback |
| RAG 记忆 | `utils/rag.ts` | Embedding + 余弦相似度 + LRU |
| DAG 引擎 | `utils/dag-engine.ts` | 拓扑排序 + 循环检测 |

### 添加新功能

1. **新 LLM 提供商**: 在 `utils/llm.ts` 和 `utils/model-presets.ts` 中添加
2. **新 UI 面板**: 在 `components/ai/` 或 `components/modules/` 中创建，在 `useUIState.ts` 添加 PanelKey
3. **新手势**: 在 `hooks/useGestureHandler.tsx` 中扩展
4. **新快捷键**: 在 `hooks/useKeyboardShortcuts.ts` 中扩展

---

## 测试

### 单元测试 (Vitest)

```bash
pnpm test          # 运行所有测试
pnpm test:watch    # 监听模式
```

### E2E 测试 (Playwright)

```bash
pnpm test:e2e      # 运行所有 E2E 测试
pnpm test:e2e:ui   # 可视化模式
```

### 测试规范

- 新功能必须包含测试
- 测试覆盖率目标: 80%+
- E2E 测试覆盖核心用户流程

---

## 文档

- 新功能需要更新相关文档
- API 变更需要更新 `docs/API_DESIGN.md`
- 架构变更需要更新 `ARCHITECTURE.md`
- 版本发布需要更新 `CHANGELOG.md`

---

## 问题反馈

- **Bug 报告**: [GitHub Issues](https://github.com/YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus/issues)
- **功能请求**: [GitHub Issues](https://github.com/YYC-Cube/YYC3-Borderless-Holographic-AI-Nexus/issues)
- **安全漏洞**: 请通过私密渠道报告，不要公开 Issue

---

## 许可证

贡献即表示你同意将你的代码以 [MIT License](LICENSE) 授权。