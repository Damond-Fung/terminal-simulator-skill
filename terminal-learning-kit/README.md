# Terminal Learning Kit

一个完整的终端模拟器和学习模块系统，基于 `claude.nagdy.me` 的实现。支持打字机动画、引导教程模式、自由输入模式，可用于构建交互式文档和教程网站。

## ✨ 特性

- 🎬 **打字机动画** - 使用 `requestAnimationFrame` 实现流畅的逐字显示
- 🖥️ **终端模拟器** - 支持引导教程模式和自由输入模式
- 🎨 **多主题支持** - macOS Dark、VS Code、Minimal 等预设主题
- ♿ **无障碍友好** - 支持 `prefers-reduced-motion` 减少动画
- 🎯 **类型安全** - 完整的 TypeScript 类型定义
- 📦 **可复用核心** - 终端状态与打字逻辑可配合任意 UI 层使用，浏览器环境开箱即用
- ⚛️ **React 组件** - 提供开箱即用的 React 组件

## 📦 安装

```bash
npm install terminal-learning-kit
```

## 🚀 快速开始

### React 使用示例

```tsx
import { TerminalSimulator, TypeWriter } from 'terminal-learning-kit/react';
import 'terminal-learning-kit/themes/macos-dark.css';

// 定义教程步骤
const steps = [
  {
    id: 'install',
    command: 'npm install my-package',
    output: 'added 42 packages in 2s',
    description: 'Install the package'
  },
  {
    id: 'init',
    command: 'npx my-package init',
    output: '✓ Project initialized',
    description: 'Initialize project'
  }
];

function App() {
  return (
    <div className="terminal-theme-macos-dark">
      {/* 打字机动画 */}
      <TypeWriter text="Hello World" speed={50} />
      
      {/* 终端模拟器 - 引导模式 */}
      <TerminalSimulator
        mode="guided"
        steps={steps}
        title="Quick Start"
        autoPlay={false}
      />
    </div>
  );
}
```

### 自由输入模式

```tsx
import { TerminalSimulator } from 'terminal-learning-kit/react';

const commands = [
  {
    command: '/help',
    handler: () => 'Available commands: /install, /build',
  },
  {
    command: '/install',
    handler: () => 'Installing dependencies...',
  },
  {
    command: '/build',
    handler: () => 'Building project...\n✓ Build successful',
  },
];

<TerminalSimulator
  mode="free-type"
  commands={commands}
  welcomeMessage="Welcome! Type /help to get started."
  onCommand={(command, output) => {
    console.log(command, output);
  }}
/>
```

## 📚 API 文档

### TypeWriter 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | - | 要显示的文本 |
| `speed` | `number` | `30` | 打字速度（ms/字符） |
| `enabled` | `boolean` | `true` | 是否启用动画 |
| `cursor` | `boolean` | `true` | 是否显示光标 |
| `cursorStyle` | `'block' \| 'line' \| 'underline'` | `'block'` | 光标样式 |
| `onComplete` | `() => void` | - | 完成回调 |
| `skipOnClick` | `boolean` | `false` | 点击跳过动画 |

### TerminalSimulator 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `'guided' \| 'free-type' \| 'playground'` | `'free-type'` | 运行模式 |
| `steps` | `TerminalStep[]` | `[]` | 引导模式的步骤 |
| `commands` | `TerminalCommand[]` | `[]` | 自由输入模式的命令 |
| `title` | `string` | `'Terminal'` | 窗口标题 |
| `variant` | `'macos' \| 'windows' \| 'ubuntu' \| 'minimal'` | `'macos'` | 窗口样式 |
| `theme` | `'dark' \| 'light' \| 'high-contrast'` | `'dark'` | 主题 |
| `autoPlay` | `boolean` | `false` | 自动播放 |
| `controls` | `boolean` | `true` | 是否显示引导模式控制区 |
| `welcomeMessage` | `string` | `'Welcome! Type /help to get started.'` | 自由输入模式欢迎语 |
| `prompt` | `string` | `'>'` | 输入提示符 |
| `onStepComplete` | `(step) => void` | - | 单步完成回调 |
| `onAllComplete` | `() => void` | - | 全部步骤完成回调 |
| `onCommand` | `(command, output) => void` | - | 提交命令后的输出回调 |

### TerminalStep 类型

```typescript
interface TerminalStep {
  id: string;
  command: string;
  output: string;
  description?: string;
  delayBefore?: number;
  delayAfter?: number;
  nextLabel?: string;
}
```

## 🎨 主题

### 预设主题

```tsx
// macOS Dark（默认）
import 'terminal-learning-kit/themes/macos-dark.css';

// VS Code 风格
import 'terminal-learning-kit/themes/vscode.css';

// 极简风格
import 'terminal-learning-kit/themes/minimal.css';
```

### 自定义主题

```css
.my-custom-theme {
  --terminal-bg: #1a1a1a;
  --terminal-fg: #e0e0e0;
  --terminal-border: #333;
  --terminal-prompt: #4fc1ff;
  --terminal-cursor: #4fc1ff;
  --terminal-button-bg: #007acc;
}
```

## 🏗️ 核心 API（可配合任意 UI 层）

如果你不想使用 React，可以直接使用核心 API。动画与快捷输入方法默认面向浏览器环境，但状态订阅和命令执行逻辑可复用到其他 UI 层：

```typescript
import { TypeWriter, TerminalSimulator } from 'terminal-learning-kit';

// 打字机
const tw = new TypeWriter({
  text: 'Hello World',
  speed: 30,
  onComplete: () => console.log('Done!')
});

tw.subscribe(state => {
  console.log(state.displayedText); // 当前显示的文本
  console.log(state.isTyping);      // 是否正在打字
});

tw.start();

// 终端模拟器
const terminal = new TerminalSimulator('guided', steps, commands);
terminal.subscribe(state => {
  console.log(state.pendingLine); // 当前正在逐字显示的行
  console.log(state.lines);       // 已完成的历史行
});
terminal.start();

// 自由输入模式也可直接驱动
terminal.setInput('/help');
await terminal.submitInput();
```

## 📁 项目结构

```
terminal-learning-kit/
├── core/                    # 框架无关核心逻辑
│   ├── typewriter.ts        # 打字机核心
│   ├── terminal.ts          # 终端模拟器核心
│   └── index.ts             # 核心导出
├── react/                   # React 组件
│   ├── TypeWriter.tsx
│   ├── TerminalSimulator.tsx
│   └── index.ts
├── themes/                  # 预设主题
│   ├── macos-dark.css
│   ├── vscode.css
│   └── minimal.css
└── examples/                # 使用示例
    └── react-basic.html
```

## 🔧 开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/terminal-learning-kit.git
cd terminal-learning-kit

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```

## 📄 许可证

MIT License

## 🙏 致谢

本项目的设计灵感来自 [claude.nagdy.me](https://claude.nagdy.me)，一个优秀的 Claude Code 学习平台。
