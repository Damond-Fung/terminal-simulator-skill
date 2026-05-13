# Terminal Simulator Skill

一个面向网站、文档、教程和产品引导页面的 `terminal-simulator` Skill。

它用于生成和优化：

- 终端风格的前端 UI
- CLI 教程式交互
- 打字机命令动画
- PowerShell / CMD / Bash / Zsh 差异化示例
- 响应式和可访问的 terminal section

这个仓库只保留与 Skill 本身直接相关的内容，不包含历史文件、临时规划文件和本地缓存。

## 仓库结构

```text
.
├── .trae/skills/terminal-simulator/   # 可直接导入 Trae 的 skill 包
├── terminal-learning-kit/             # skill 配套的可复用实现与 demo
├── terminal-simulator.zip             # 打包后的跨平台 zip 技能包
├── README.md
└── LICENSE
```

## Skill 内容

`terminal-simulator` Skill 包含：

- `SKILL.md`：触发条件、能力边界、实现规则、交付规范
- `examples/`：输入输出示例
- `templates/`：React 与静态 HTML 模板
- `resources/`：跨平台终端适配说明

Skill 路径：

```text
.trae/skills/terminal-simulator
```

## Companion 实现

仓库附带 `terminal-learning-kit`，方便在实际项目中直接复用：

- `core/`：终端状态与打字机逻辑
- `react/`：React 组件
- `themes/`：主题样式
- `examples/react-basic.html`：本地预览 demo

## 如何导入 Skill

在 Trae 中：

1. 打开 `Settings`
2. 打开 `Rule & Skills`
3. 打开 `Skills`
4. 选择 `Create` 或导入 `.trae/skills/terminal-simulator/SKILL.md`

如果你只下载 zip，请先解压，再导入其中的 `SKILL.md`。

## 如何本地预览

在 `terminal-learning-kit` 目录执行：

```bash
npm install
npm run build
npx serve . -l 4173
```

然后访问：

```text
http://localhost:4173/examples/react-basic.html
```

## 适用场景

这个 Skill 适合以下需求：

- 官网 Hero 区的安装终端演示
- 文档站中的 CLI 快速开始
- Onboarding 页的步骤式命令播放
- 开发者产品的 fake terminal UI
- 现有 terminal 组件的动画、响应式和无障碍优化

不适用于：

- 真实 shell 自动化
- 后端命令执行
- 运维脚本调度
